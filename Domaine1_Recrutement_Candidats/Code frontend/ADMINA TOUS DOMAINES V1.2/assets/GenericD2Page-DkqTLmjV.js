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
import {
  a as _,
  i as v,
  n as te,
  o as ne,
  r as y,
  t as b,
} from "./TableRow-BqEqVmYd.js";
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
import {
  a as q,
  i as J,
  n as Y,
  r as X,
  t as Z,
} from "./components-jUwzSD7P.js";
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
import { t as TUNE } from "./Tune-D67V1qnY.js";
import { t as HIS } from "./History-BcPnGU_q.js";
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
        {
          key: `employee`,
          label: `Employé`,
          render: (e) => B(R(e.employee_id)),
        },
        {
          key: `date_avenant`,
          label: `Date`,
          render: (e) => A(e.date_avenant),
        },
        {
          key: `type_modification`,
          label: `Type`,
          render: (e) =>
            (0, $.jsx)(T, {
              label: e.type_modification,
              size: `small`,
              color:
                e.type_modification === `Salaire`
                  ? `success`
                  : e.type_modification === `Poste`
                    ? `primary`
                    : `warning`,
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
              sx: {
                color:
                  e.type_modification === `Salaire`
                    ? `success.main`
                    : `primary.main`,
              },
              children: e.nouvelle_valeur,
            }),
        },
        { key: `motif`, label: `Motif` },
        {
          key: `date_effet`,
          label: `Date effet`,
          render: (e) => A(e.date_effet),
        },
        {
          key: `statut`,
          label: `Statut`,
          render: (e) => (0, $.jsx)(q, { status: e.statut }),
        },
      ],
      data: G,
      canCreate: !0,
      canExport: !0,
    },
    documents: {
      title: `Suivi des documents`,
      subtitle: `Alertes expiration · déclenche rappels auto si < 15 jours`,
      alert: (e) => {
        let t = e.filter(
          (e) => e.statut === `Expire` || e.statut === `A renouveler`,
        );
        return t.length > 0
          ? `${t.length} document(s) à renouveler ou expiré(s)`
          : null;
      },
      columns: [
        {
          key: `employee`,
          label: `Employé`,
          render: (e) => B(R(e.employee_id)),
        },
        {
          key: `type_document`,
          label: `Type`,
          render: (e) =>
            (0, $.jsx)(T, {
              label: e.type_document,
              size: `small`,
              variant: `outlined`,
            }),
        },
        {
          key: `numero_document`,
          label: `N° Document`,
          render: (e) =>
            (0, $.jsx)(i, {
              variant: `caption`,
              sx: { fontFamily: `monospace` },
              children: e.numero_document,
            }),
        },
        {
          key: `date_emission`,
          label: `Émission`,
          render: (e) => A(e.date_emission),
        },
        {
          key: `date_expiration`,
          label: `Expiration`,
          render: (e) => A(e.date_expiration),
        },
        {
          key: `jours`,
          label: `Jours restants`,
          render: (e) => (0, $.jsx)(Z, { date: e.date_expiration }),
        },
        {
          key: `statut`,
          label: `Statut`,
          render: (e) =>
            (0, $.jsx)(q, {
              status: e.statut,
              label: j.statut_document[e.statut],
            }),
        },
        { key: `lieu_depot`, label: `Lieu dépôt` },
      ],
      data: K,
    },
    bancaires: {
      title: `Données bancaires`,
      subtitle: `RIB masqué partiellement (****1234) — sécurité RGPD`,
      columns: [
        {
          key: `employee`,
          label: `Employé`,
          render: (e) => B(R(e.employee_id)),
        },
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
        {
          key: `statut`,
          label: `Statut`,
          render: (e) => (0, $.jsx)(q, { status: e.statut }),
        },
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
        {
          key: `employee`,
          label: `Employé`,
          render: (e) => B(R(e.employee_id)),
        },
        { key: `organisme`, label: `Organisme` },
        {
          key: `numero_adherent`,
          label: `N° Adhérent`,
          render: (e) =>
            (0, $.jsx)(i, {
              variant: `caption`,
              sx: { fontFamily: `monospace` },
              children: e.numero_adherent,
            }),
        },
        {
          key: `date_adhesion`,
          label: `Adhésion`,
          render: (e) => A(e.date_adhesion),
        },
        {
          key: `couverture`,
          label: `Couverture`,
          render: (e) =>
            (0, $.jsx)(T, {
              label: e.couverture,
              size: `small`,
              variant: `outlined`,
            }),
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
          render: (e) =>
            (0, $.jsx)(q, {
              status: e.statut,
              label: j.statut_adhesion?.[e.statut] || e.statut,
            }),
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
        {
          key: `employee`,
          label: `Employé`,
          render: (e) => B(R(e.employee_id)),
        },
        {
          key: `type_permit`,
          label: `Type`,
          render: (e) =>
            (0, $.jsx)(T, {
              label: e.type_permit,
              size: `small`,
              variant: `outlined`,
            }),
        },
        {
          key: `numero_permit`,
          label: `N° Permis`,
          render: (e) =>
            (0, $.jsx)(i, {
              variant: `caption`,
              sx: { fontFamily: `monospace` },
              children: e.numero_permit,
            }),
        },
        {
          key: `date_delivrance`,
          label: `Délivrance`,
          render: (e) => A(e.date_delivrance),
        },
        {
          key: `date_expiration`,
          label: `Expiration`,
          render: (e) => A(e.date_expiration),
        },
        {
          key: `jours`,
          label: `Jours restants`,
          render: (e) => (0, $.jsx)(Z, { date: e.date_expiration }),
        },
        { key: `autorite`, label: `Autorité` },
        {
          key: `statut`,
          label: `Statut`,
          render: (e) =>
            (0, $.jsx)(q, {
              status: e.statut,
              label: j.statut_permit[e.statut],
            }),
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
        {
          key: `employee`,
          label: `Employé`,
          render: (e) => B(R(e.employee_id)),
        },
        {
          key: `droit_annuel_jours`,
          label: `Droit annuel`,
          align: `right`,
          render: (e) => `${e.droit_annuel_jours} j`,
        },
        {
          key: `conges_pris_jours`,
          label: `Pris`,
          align: `right`,
          render: (e) => `${e.conges_pris_jours} j`,
        },
        {
          key: `conges_en_cours`,
          label: `En cours`,
          align: `right`,
          render: (e) => `${e.conges_en_cours} j`,
        },
        {
          key: `solde_disponible`,
          label: `Solde disponible`,
          align: `right`,
          render: (e) =>
            (0, $.jsxs)(i, {
              variant: `body2`,
              fontWeight: 700,
              sx: {
                color: e.solde_disponible < 5 ? `error.main` : `success.main`,
              },
              children: [e.solde_disponible, ` j`],
            }),
        },
        {
          key: `taux_utilisation`,
          label: `Taux utilisation`,
          render: (e) =>
            (0, $.jsx)(X, {
              value: e.taux_utilisation,
              max: 100,
              label: `${e.taux_utilisation}%`,
            }),
        },
      ],
      data: N,
    },
    absences: {
      title: `Absences maladie`,
      subtitle: `Workflow: déclaration → upload justificatif → validation manager → visite reprise si > 3j`,
      columns: [
        {
          key: `employee`,
          label: `Employé`,
          render: (e) => B(R(e.employee_id)),
        },
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
        {
          key: `duree_jours`,
          label: `Durée`,
          align: `right`,
          render: (e) => `${e.duree_jours} j`,
        },
        { key: `motif`, label: `Motif` },
        {
          key: `statut`,
          label: `Statut`,
          render: (e) =>
            (0, $.jsx)(q, {
              status: e.statut,
              label: j.statut_absence?.[e.statut],
            }),
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
        {
          key: `employee`,
          label: `Employé`,
          render: (e) => B(R(e.employee_id)),
        },
        { key: `semaine`, label: `Semaine` },
        {
          key: `heures_normales`,
          label: `Heures normales`,
          align: `right`,
          render: (e) => `${e.heures_normales}h`,
        },
        {
          key: `heures_supp`,
          label: `Heures supp.`,
          align: `right`,
          render: (e) =>
            (0, $.jsx)(T, {
              label: `${e.heures_supp}h`,
              size: `small`,
              color: `primary`,
              variant: `outlined`,
            }),
        },
        {
          key: `taux_majoration`,
          label: `Taux`,
          render: (e) =>
            (0, $.jsx)(T, {
              label: e.taux_majoration,
              size: `small`,
              variant: `outlined`,
            }),
        },
        {
          key: `montant_calcule`,
          label: `Montant calculé`,
          align: `right`,
          render: (e) => (0, $.jsx)(Y, { value: e.montant_calcule }),
        },
        {
          key: `valide_par`,
          label: `Validé par`,
          render: (e) => (e.valide_par ? B(R(e.valide_par)) : `—`),
        },
        {
          key: `statut`,
          label: `Statut`,
          render: (e) =>
            (0, $.jsx)(q, {
              status: e.statut,
              label: j.statut_heures[e.statut],
            }),
        },
      ],
      data: z,
    },
    pointage: {
      title: `Pointage de présence`,
      subtitle: `Saisie quotidienne → validation hebdo manager → export planning + paie`,
      columns: [
        {
          key: `employee`,
          label: `Employé`,
          render: (e) => B(R(e.employee_id)),
        },
        { key: `semaine`, label: `Semaine` },
        { key: `jours_presents`, label: `Présents`, align: `right` },
        { key: `jours_absents`, label: `Absents`, align: `right` },
        { key: `retards_minutes`, label: `Retards (min)`, align: `right` },
        {
          key: `taux_presence`,
          label: `Taux présence`,
          render: (e) =>
            (0, $.jsx)(X, {
              value: e.taux_presence,
              max: 100,
              label: `${e.taux_presence}%`,
            }),
        },
        {
          key: `statut`,
          label: `Statut`,
          render: (e) => (0, $.jsx)(q, { status: e.statut }),
        },
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
        {
          key: `employee`,
          label: `Employé`,
          render: (e) => B(R(e.employee_id)),
        },
        { key: `mois`, label: `Mois` },
        { key: `jours_ouvrables`, label: `Ouvrables`, align: `right` },
        { key: `jours_presents`, label: `Présents`, align: `right` },
        { key: `jours_absents`, label: `Absents`, align: `right` },
        {
          key: `heures_supp`,
          label: `Heures supp.`,
          align: `right`,
          render: (e) => `${e.heures_supp}h`,
        },
        {
          key: `taux_presence`,
          label: `Taux`,
          render: (e) =>
            (0, $.jsx)(X, {
              value: e.taux_presence,
              max: 100,
              label: `${e.taux_presence}%`,
            }),
        },
        {
          key: `statut`,
          label: `Statut`,
          render: (e) => (0, $.jsx)(q, { status: e.statut }),
        },
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
        {
          key: `employee`,
          label: `Employé`,
          render: (e) => B(R(e.employee_id)),
        },
        { key: `mois`, label: `Mois` },
        {
          key: `salaire_brut`,
          label: `Brut`,
          align: `right`,
          render: (e) => (0, $.jsx)(Y, { value: e.salaire_brut }),
        },
        {
          key: `cotisations`,
          label: `Cotisations`,
          align: `right`,
          render: (e) => (0, $.jsx)(Y, { value: e.cotisations }),
        },
        {
          key: `taux_charges`,
          label: `Taux`,
          align: `right`,
          render: (e) => `${e.taux_charges}%`,
        },
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
          render: (e) =>
            (0, $.jsx)(T, {
              label: e.mode_paie,
              size: `small`,
              variant: `outlined`,
            }),
        },
        {
          key: `statut`,
          label: `Statut`,
          render: (e) => (0, $.jsx)(q, { status: e.statut }),
        },
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
        return t.length > 0
          ? `${t.length} déclaration(s) en retard — action urgente`
          : null;
      },
      columns: [
        {
          key: `organisme`,
          label: `Organisme`,
          render: (e) =>
            (0, $.jsx)(T, {
              label: e.organisme,
              size: `small`,
              color: `primary`,
              variant: `outlined`,
            }),
        },
        { key: `type_declaration`, label: `Type` },
        { key: `periode`, label: `Période` },
        {
          key: `montant`,
          label: `Montant`,
          align: `right`,
          render: (e) => (0, $.jsx)(Y, { value: e.montant }),
        },
        {
          key: `date_soumission`,
          label: `Soumise le`,
          render: (e) => (e.date_soumission ? A(e.date_soumission) : `—`),
        },
        {
          key: `date_echeance`,
          label: `Échéance`,
          render: (e) => A(e.date_echeance),
        },
        { key: `nombre_salaries`, label: `Salariés`, align: `right` },
        {
          key: `statut`,
          label: `Statut`,
          render: (e) =>
            (0, $.jsx)(q, {
              status: e.statut,
              label: j.statut_declaration[e.statut],
            }),
        },
      ],
      data: U,
    },
    prets: {
      title: `Prêts & avances`,
      subtitle: `Calculateur mensualité: M = (P × r/12) / (1 - (1+r/12)^-n) · Déductions auto en paie`,
      columns: [
        {
          key: `employee`,
          label: `Employé`,
          render: (e) => B(R(e.employee_id)),
        },
        {
          key: `type_pret`,
          label: `Type`,
          render: (e) =>
            (0, $.jsx)(T, {
              label: j.type_pret[e.type_pret],
              size: `small`,
              variant: `outlined`,
            }),
        },
        {
          key: `montant_accorde`,
          label: `Montant`,
          align: `right`,
          render: (e) => (0, $.jsx)(Y, { value: e.montant_accorde }),
        },
        {
          key: `taux_interet`,
          label: `Taux`,
          align: `right`,
          render: (e) => `${e.taux_interet}%`,
        },
        {
          key: `mensualite`,
          label: `Mensualité`,
          align: `right`,
          render: (e) => (0, $.jsx)(Y, { value: e.mensualite }),
        },
        {
          key: `duree_mois`,
          label: `Durée`,
          align: `right`,
          render: (e) => `${e.duree_mois} mois`,
        },
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
          render: (e) =>
            (0, $.jsx)(q, { status: e.statut, label: j.statut_pret[e.statut] }),
        },
      ],
      data: F,
    },
    sanctions: {
      title: `Sanctions disciplinaires`,
      subtitle: `4 niveaux: oral → écrit → blâme → suspension · Procédure légale (convocation 5j min)`,
      columns: [
        {
          key: `employee`,
          label: `Employé`,
          render: (e) => B(R(e.employee_id)),
        },
        {
          key: `type_sanction`,
          label: `Type`,
          render: (e) => {
            let t =
              e.type_sanction === `avertissement_oral` ||
              e.type_sanction === `avertissement_ecrit`
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
        {
          key: `date_faute`,
          label: `Date faute`,
          render: (e) => A(e.date_faute),
        },
        {
          key: `date_notification`,
          label: `Notification`,
          render: (e) => A(e.date_notification),
        },
        {
          key: `duree_suspension_jours`,
          label: `Suspension`,
          align: `right`,
          render: (e) =>
            e.duree_suspension_jours ? `${e.duree_suspension_jours} j` : `—`,
        },
        {
          key: `valide_par`,
          label: `Validé par`,
          render: (e) => B(R(e.valide_par)),
        },
        {
          key: `statut`,
          label: `Statut`,
          render: (e) => (0, $.jsx)(q, { status: e.statut }),
        },
      ],
      data: L,
    },
    "visites-medicales": {
      title: `Visites médicales`,
      subtitle: `4 types: embauche, périodique, reprise, demandée · 4 niveaux aptitude`,
      columns: [
        {
          key: `employee`,
          label: `Employé`,
          render: (e) => B(R(e.employee_id)),
        },
        {
          key: `type_visite`,
          label: `Type`,
          render: (e) =>
            (0, $.jsx)(T, {
              label: j.type_visite[e.type_visite],
              size: `small`,
              variant: `outlined`,
            }),
        },
        { key: `medecin_structure`, label: `Médecin/Structure` },
        {
          key: `date_visite`,
          label: `Visite`,
          render: (e) => A(e.date_visite),
        },
        {
          key: `date_prochaine_visite`,
          label: `Prochaine`,
          render: (e) => (0, $.jsx)(Z, { date: e.date_prochaine_visite }),
        },
        {
          key: `aptitude`,
          label: `Aptitude`,
          render: (e) =>
            (0, $.jsx)(q, {
              status: e.aptitude,
              label: j.aptitude[e.aptitude],
            }),
        },
        {
          key: `cout`,
          label: `Coût`,
          align: `right`,
          render: (e) => (0, $.jsx)(Y, { value: e.cout }),
        },
      ],
      data: P,
    },
    departs: {
      title: `Dossiers de départs`,
      subtitle: `Checklist complète: attestation, certificat, solde tout compte, restitution matériel`,
      columns: [
        {
          key: `employee`,
          label: `Employé`,
          render: (e) => B(R(e.employee_id)),
        },
        {
          key: `date_depart`,
          label: `Date départ`,
          render: (e) => A(e.date_depart),
        },
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
        {
          key: `indemnite`,
          label: `Indemnité`,
          align: `right`,
          render: (e) => (0, $.jsx)(Y, { value: e.indemnite }),
        },
        {
          key: `documents_remis`,
          label: `Documents`,
          render: (e) =>
            (0, $.jsxs)(i, {
              variant: `caption`,
              children: [e.documents_remis?.length || 0, `/4`],
            }),
        },
        {
          key: `statut_dossier`,
          label: `Statut`,
          render: (e) =>
            (0, $.jsx)(q, {
              status: e.statut_dossier,
              label: j.statut_dossier[e.statut_dossier],
            }),
        },
      ],
      data: V,
    },
    archivage: {
      title: `Archivage documents`,
      subtitle: `Durées de conservation: 1 an / 3 ans / 5 ans (selon nature) — verrouillage en lecture seule`,
      columns: [
        {
          key: `employee`,
          label: `Employé`,
          render: (e) => B(R(e.employee_id)),
        },
        { key: `type_document`, label: `Type` },
        {
          key: `date_archive`,
          label: `Date archive`,
          render: (e) => A(e.date_archive),
        },
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
          render: (e) =>
            (0, $.jsx)(T, {
              label: j.type_rappel[e.type_rappel],
              size: `small`,
              variant: `outlined`,
            }),
        },
        { key: `description`, label: `Description` },
        {
          key: `employee`,
          label: `Employé`,
          render: (e) => B(R(e.employee_id)),
        },
        {
          key: `date_echeance`,
          label: `Échéance`,
          render: (e) => A(e.date_echeance),
        },
        {
          key: `jours`,
          label: `Statut échéance`,
          render: (e) => (0, $.jsx)(Z, { date: e.date_echeance }),
        },
        {
          key: `responsable`,
          label: `Responsable`,
          render: (e) => B(R(e.responsable_suivi)),
        },
        { key: `action_requise`, label: `Action requise` },
        {
          key: `statut`,
          label: `Statut`,
          render: (e) =>
            (0, $.jsx)(q, {
              status: e.statut,
              label: j.statut_rappel[e.statut],
            }),
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
var SLD_PALETTE = [
  `#7e3ff2`,
  `#0ea5e9`,
  `#f59e0b`,
  `#10b981`,
  `#ef4444`,
  `#8b5cf6`,
  `#06b6d4`,
  `#ec4899`,
  `#84cc16`,
  `#f97316`,
];
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
  for (var yy = 2022; yy <= 2032; yy++)
    sldFeriesListe(yy).forEach((x) => s.add(x));
  try {
    var raw = localStorage.getItem(SLD_LS);
    if (raw) {
      var st = JSON.parse(raw);
      ((st && st.meta && st.meta.feriesExtra) || []).forEach(
        (x) => x && s.add(x),
      );
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
      if (
        st &&
        st.v === 3 &&
        Array.isArray(st.demandes) &&
        st.demandes.length > 0
      )
        return st.demandes;
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
function sldDroit(emp, annee, P) {
  if (!P) P = SLD3_DEF;
  var base =
      emp && emp.categorie === `Cadre` ? P.baseCadre || 30 : P.baseAutre || 26,
    em = new Date(emp.date_embauche),
    moisT = 12;
  if (em.getFullYear() === annee) moisT = 12 - em.getMonth();
  else if (em.getFullYear() > annee) moisT = 0;
  var droit = Math.round((base * moisT) / 12);
  return { droit: droit, base: base, prorata: droit < base ? 1 : 0 };
}
function sldStatut(m, P) {
  if (!P) P = SLD3_DEF;
  var sS = P.seuilSous == null ? 40 : P.seuilSous,
    sT = P.seuilTendu == null ? 75 : P.seuilTendu;
  if (m.prev < 0 || m.dispo < 0)
    return { key: `critique`, label: `Critique`, color: `error`, filled: !0 };
  if (m.taux > sT)
    return { key: `tendu`, label: `Tendu`, color: `warning`, filled: !0 };
  if (m.taux < sS)
    return {
      key: `sousUtilise`,
      label: `Sous-utilisé`,
      color: `info`,
      filled: !1,
    };
  return { key: `sain`, label: `Sain`, color: `success`, filled: !1 };
}
/* ================================================================
   PACK COCKPIT V3 — paramètres persistants, ajustements + journal
   d'audit, échéance légale art. 89 CT, indemnité compensatrice
   art. 90 CT. Stockage dédié : admina_d2_soldes_v3 (indépendant du
   store Congés V2 et du store Absences V2).
   ================================================================ */
var SLD3_LS = `admina_d2_soldes_v3`;
var SLD3_DEF = {
  seuilSous: 40,
  seuilTendu: 75,
  baseCadre: 30,
  baseAutre: 26,
  coutFixe: 20000,
  coutFixeOn: 0,
};
function sld3Store() {
  var d = {
    v: 1,
    ajust: [],
    meta: { parametres: Object.assign({}, SLD3_DEF) },
  };
  try {
    var raw = localStorage.getItem(SLD3_LS);
    if (raw) {
      var st = JSON.parse(raw);
      if (st && Array.isArray(st.ajust)) {
        d.ajust = st.ajust;
        d.meta.parametres = Object.assign(
          {},
          SLD3_DEF,
          (st.meta && st.meta.parametres) || {},
        );
      }
    }
  } catch (err) {}
  return d;
}
function sld3Write(st) {
  try {
    localStorage.setItem(SLD3_LS, JSON.stringify(st));
  } catch (err) {}
}
function sld3Params() {
  return sld3Store().meta.parametres;
}
function sld3AjustEmp(st, empId, annee) {
  var n = 0;
  (st.ajust || []).forEach((x) => {
    if (
      x.emp_id === empId &&
      (annee == null || String(x.annee) === String(annee))
    )
      n += x.jours;
  });
  return n;
}
function sldCoutJour(emp, P) {
  if (!P) P = SLD3_DEF;
  return P.coutFixeOn
    ? Number(P.coutFixe) || 0
    : emp && emp.salaire_brut
      ? emp.salaire_brut / 26
      : 0;
}
function sldIndemnite(m, P) {
  return Math.max(m.dispo, 0) * sldCoutJour(m.emp, P);
}
/* Échéance légale art. 89 CT : les droits ouverts au titre d'un exercice
   doivent être consommés dans les 12 mois. Le report N-1 affiché sur
   l'exercice N provient des droits de N-1 → échéance = 31/12 de N.
   Les jours pris consomment en priorité le report (FIFO légal des droits
   les plus anciens). */
function sldEcheance(m, anneeRef) {
  if (!m || m.report <= 0) return null;
  var restant = Math.max(0, m.report - Math.max(m.pris, 0));
  if (restant <= 0) return null;
  var ech = new Date(anneeRef, 11, 31),
    auj = new Date(),
    jr = Math.ceil((ech - auj) / 864e5);
  return {
    restant: restant,
    echeance: `31/12/` + anneeRef,
    jrest: jr,
    expire: jr < 0,
    urgence: jr < 0 ? `expiree` : jr <= 90 ? `echoire` : `info`,
  };
}
var SLD3_AJUST_TYPES = {
  recuperation: [`Récupération (jour férié travaillé, repos compensateur)`, 1],
  regularisation: [`Régularisation comptable`, 0],
  sans_solde: [`Congé sans solde (déduit du solde)`, -1],
  correction: [`Correction d'erreur de saisie`, 0],
};
function sldHash(s) {
  var h = 0;
  for (var i2 = 0; i2 < s.length; i2++)
    h = ((h * 31 + s.charCodeAt(i2)) & 0x7fffffff) >>> 0;
  return h;
}
function sldInitiales(nom) {
  var p = String(nom || `?`)
    .trim()
    .split(/\s+/);
  return (
    (p[0] || `?`)[0] + (p[1] ? p[1][0] : p[0].length > 1 ? p[0][1] : ``)
  ).toUpperCase();
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
  return (
    String(Math.round(n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ` `) + ` FCFA`
  );
}
function sldSigne(n) {
  return n > 0 ? `+` + n : String(n);
}
function sldSpark(pts) {
  var w = 260,
    h = 54,
    mx = Math.max.apply(null, pts.concat([1])),
    n = pts.length;
  var path = pts
    .map(
      (p2, idx) =>
        (idx === 0 ? `M` : `L`) +
        ((idx / (n - 1)) * (w - 8) + 4).toFixed(1) +
        `,` +
        (h - 6 - (p2 / mx) * (h - 12)).toFixed(1),
    )
    .join(` `);
  return (0, $.jsxs)(`svg`, {
    viewBox: `0 0 ` + w + ` ` + h,
    width: `100%`,
    height: h,
    preserveAspectRatio: `none`,
    children: [
      (0, $.jsx)(`path`, {
        d: path + ` L` + (w - 4) + `,` + (h - 2) + ` L4,` + (h - 2) + ` Z`,
        fill: `rgba(126,63,242,.12)`,
        stroke: `none`,
      }),
      (0, $.jsx)(`path`, {
        d: path,
        fill: `none`,
        stroke: `#7e3ff2`,
        strokeWidth: 2,
      }),
    ],
  });
}

function SldKpi(pg) {
  var IC = pg.ic;
  return (0, $.jsxs)(a, {
    onClick: pg.onClic,
    sx: {
      p: 2,
      borderRadius: 3,
      cursor: `pointer`,
      minWidth: 0,
      bgcolor: `background.paper`,
      background: pg.grad
        ? `linear-gradient(135deg,#7e3ff2 0%,#9d6bff 100%)`
        : undefined,
      color: pg.grad ? `#fff` : `text.primary`,
      border: `1px solid`,
      borderColor: pg.actif ? `#7e3ff2` : `divider`,
      boxShadow: pg.actif ? 4 : 1,
      transition: `box-shadow .2s`,
      "&:hover": { boxShadow: 6 },
    },
    children: [
      (0, $.jsx)(IC, {
        sx: {
          fontSize: 30,
          mb: 0.5,
          color: pg.grad
            ? `rgba(255,255,255,.92)`
            : pg.couleur || `primary.main`,
        },
      }),
      (0, $.jsx)(i, { variant: `h5`, fontWeight: 800, children: pg.valeur }),
      (0, $.jsx)(i, {
        variant: `body2`,
        fontWeight: 700,
        sx: { color: pg.grad ? `rgba(255,255,255,.9)` : `text.primary` },
        children: pg.label,
      }),
      pg.sub
        ? (0, $.jsx)(i, {
            variant: `caption`,
            sx: {
              display: `block`,
              mt: 0.5,
              color: pg.grad ? `rgba(255,255,255,.75)` : `text.secondary`,
            },
            children: pg.sub,
          })
        : null,
    ],
  });
}
function SldTuile(pg) {
  return (0, $.jsxs)(a, {
    sx: {
      border: `1px solid`,
      borderColor: `divider`,
      borderRadius: 2,
      p: 1.5,
      textAlign: `center`,
      bgcolor: `background.default`,
    },
    children: [
      (0, $.jsx)(i, {
        variant: `caption`,
        sx: { color: `text.secondary`, fontWeight: 600 },
        children: pg.label,
      }),
      (0, $.jsx)(i, {
        variant: `h6`,
        fontWeight: 800,
        sx: { color: pg.couleur || `text.primary` },
        children: pg.valeur,
      }),
    ],
  });
}
function sldBarre(pct, couleur) {
  var p2 = Math.max(0, Math.min(100, pct || 0));
  return (0, $.jsxs)(a, {
    sx: { display: `flex`, alignItems: `center`, gap: 1, minWidth: 130 },
    children: [
      (0, $.jsx)(a, {
        sx: {
          flex: 1,
          height: 8,
          borderRadius: 4,
          bgcolor: `action.hover`,
          overflow: `hidden`,
        },
        children: (0, $.jsx)(a, {
          sx: {
            width: p2 + `%`,
            height: `100%`,
            borderRadius: 4,
            bgcolor: couleur,
          },
        }),
      }),
      (0, $.jsx)(i, {
        variant: `caption`,
        fontWeight: 800,
        children: p2 + `%`,
      }),
    ],
  });
}
function sldChipStatut(m, P) {
  var st = sldStatut(m, P);
  return (0, $.jsx)(T, {
    label: st.label,
    size: `small`,
    color: st.color,
    variant: st.filled ? `filled` : `outlined`,
    sx: { fontWeight: 700, fontSize: `0.7rem` },
  });
}
function sldChipDemande(st) {
  var mp = {
      approuvee: [`Approuvée`, `success`],
      en_attente: [`En attente`, `warning`],
      refusee: [`Refusée`, `error`],
      annulee: [`Annulée`, `default`],
    },
    x2 = mp[st] || [st, `default`];
  return (0, $.jsx)(T, {
    label: x2[0],
    size: `small`,
    color: x2[1],
    variant: `outlined`,
    sx: { fontWeight: 700, fontSize: `0.7rem` },
  });
}
function sldAlertePerso(m, P) {
  var st = sldStatut(m, P);
  if (st.key === `critique`)
    return (0, $.jsx)(c, {
      severity: `error`,
      icon: (0, $.jsx)(w, {}),
      sx: { mb: 2, fontWeight: 600 },
      children:
        `Solde négatif` +
        (m.att > 0
          ? ` si les demandes en attente sont approuvées (projection ` +
            m.prev +
            ` j)`
          : ``) +
        ` — arbitrage DRH requis : refus motivé, report ou congé sans solde.`,
    });
  if (st.key === `sousUtilise`)
    return (0, $.jsx)(c, {
      severity: `warning`,
      sx: { mb: 2, fontWeight: 600 },
      children: `Moins de 40 % du droit annuel consommé — encouragez la planification : le repos annuel est une obligation légale (art. 89 et s. Code du travail) et un facteur de prévention burn-out.`,
    });
  if (st.key === `tendu`)
    return (0, $.jsx)(c, {
      severity: `info`,
      sx: { mb: 2, fontWeight: 600 },
      children: `Taux d'utilisation élevé (> 75 %) — veiller à conserver une couverture d'équipe suffisante.`,
    });
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
    detId = stDet[0],
    setDetail = stDet[1],
    stAdj = (0, Q.useState)(null),
    adj = stAdj[0],
    setAdj = stAdj[1],
    stAdjF = (0, Q.useState)({
      type: `recuperation`,
      sens: 1,
      jours: 1,
      motif: ``,
    }),
    adjF = stAdjF[0],
    setAdjF = stAdjF[1],
    stSimu = (0, Q.useState)(0),
    simu = stSimu[0],
    setSimu = stSimu[1],
    stPol = (0, Q.useState)({ politique: `integrale`, plafond: 10 }),
    pol = stPol[0],
    setPol = stPol[1],
    stJrn = (0, Q.useState)(0),
    jrn = stJrn[0],
    setJrn = stJrn[1],
    stPar = (0, Q.useState)(0),
    par = stPar[0],
    setPar = stPar[1],
    stEche = (0, Q.useState)(`tous`),
    echeF = stEche[0],
    setEche = stEche[1],
    stCh = (0, Q.useState)(1),
    chOpen = stCh[0],
    setCh = stCh[1],
    stP = (0, Q.useState)(sld3Params()),
    P = stP[0],
    setP = stP[1],
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
      ST = sld3Store(),
      anneeSel = exo === `tous` ? AN : parseInt(exo, 10);
    return H.map((emp) => {
      var dr = sldDroit(emp, anneeSel, P),
        rep = anneeSel === AN ? sldReport(emp.id, meta) : 0,
        pris = 0,
        att = 0,
        dems = [];
      DEM.forEach((q2) => {
        if (q2.employee_id !== emp.id || q2.type_conge !== `conge_annuel`)
          return;
        var an = String(q2.date_debut || ``).slice(0, 4);
        if (exo !== `tous` && an !== exo) return;
        var oj = sldOuvrables(q2.date_debut, q2.date_fin, FER);
        if (q2.statut === `approuvee`) pris += oj;
        else if (q2.statut === `en_attente`) att += oj;
        dems.push(q2);
      });
      var aj = sld3AjustEmp(ST, emp.id, exo === `tous` ? null : anneeSel),
        dispo = dr.droit + rep - pris + aj,
        prev = dispo - att,
        taux = dr.droit > 0 ? Math.round((pris / dr.droit) * 100) : 0;
      var delta = null;
      if (exo !== `tous`) {
        var drP = sldDroit(emp, anneeSel - 1, P),
          prisP = 0;
        DEM.forEach((q2) => {
          if (
            q2.employee_id !== emp.id ||
            q2.type_conge !== `conge_annuel` ||
            q2.statut !== `approuvee`
          )
            return;
          if (String(q2.date_debut || ``).slice(0, 4) !== String(anneeSel - 1))
            return;
          prisP += sldOuvrables(q2.date_debut, q2.date_fin, FER);
        });
        delta = dr.droit + rep - pris + aj - (drP.droit - prisP);
      }
      var mm = {
        emp: emp,
        droit: dr.droit,
        base: dr.base,
        prorata: dr.prorata,
        report: rep,
        pris: pris,
        att: att,
        dispo: dispo,
        prev: prev,
        taux: taux,
        dems: dems,
        aj: aj,
        delta: delta,
      };
      mm.ech = sldEcheance(mm, anneeSel);
      return mm;
    });
  }, [tick, exo, P]);
  var detail = (0, Q.useMemo)(
    () =>
      detId == null ? null : calc.find((x2) => x2.emp.id === detId) || null,
    [calc, detId],
  );
  var journal = (0, Q.useMemo)(
    () =>
      sld3Store()
        .ajust.slice()
        .sort((x1, x2) => (x1.ts < x2.ts ? 1 : -1)),
    [jrn, tick],
  );
  var depts = (0, Q.useMemo)(() => {
    var s2 = new Set();
    H.forEach((e2) => e2.departement && s2.add(e2.departement));
    return Array.from(s2).sort();
  }, []);
  var flt = (0, Q.useMemo)(
    () =>
      calc.filter((m2) => {
        if (dept !== `tous` && m2.emp.departement !== dept) return !1;
        var st = sldStatut(m2, P);
        if (statutF !== `tous` && st.key !== statutF) return !1;
        if (echeF !== `tous`) {
          var ec = m2.ech;
          if (echeF === `echoire` && (!ec || ec.urgence !== `echoire`))
            return !1;
          if (echeF === `expiree` && (!ec || !ec.expire)) return !1;
        }
        if (rech) {
          var q2 = rech.toLowerCase(),
            nm = B(m2.emp).toLowerCase();
          if (
            !nm.includes(q2) &&
            !String(m2.emp.matricule || ``)
              .toLowerCase()
              .includes(q2) &&
            !String(m2.emp.departement || ``)
              .toLowerCase()
              .includes(q2)
          )
            return !1;
        }
        return !0;
      }),
    [calc, dept, statutF, rech, echeF],
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
      case `eche`:
        k1 = m1.ech ? m1.ech.jrest : 99999;
        k2 = m2.ech ? m2.ech.jrest : 99999;
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
      prov = 0,
      expN = 0,
      expJ = 0;
    flt.forEach((m2) => {
      tot += Math.max(m2.dispo, 0);
      sTaux += m2.taux;
      var st = sldStatut(m2, P);
      if (st.key === `critique`) crit++;
      if (st.key === `sousUtilise`) sousU++;
      prov += Math.max(m2.dispo, 0) * sldCoutJour(m2.emp, P);
      if (m2.ech && !m2.ech.expire) {
        expN++;
        expJ += m2.ech.restant;
      }
    });
    return {
      tot: tot,
      crit: crit,
      sousU: sousU,
      tauxMoy: flt.length ? Math.round(sTaux / flt.length) : 0,
      prov: prov,
      expN: expN,
      expJ: expJ,
    };
  }, [flt, P]);
  var chStats = (0, Q.useMemo)(() => {
    var n = { critique: 0, tendu: 0, sain: 0, sousUtilise: 0 };
    flt.forEach((m2) => n[sldStatut(m2, P).key]++);
    return n;
  }, [flt, P]);
  var chDepts = (0, Q.useMemo)(() => {
    var s2 = {};
    flt.forEach((m2) => {
      var dp = m2.emp.departement || `—`;
      if (!s2[dp]) s2[dp] = { dept: dp, n: 0, dispo: 0, taux: 0 };
      s2[dp].n++;
      s2[dp].dispo += Math.max(m2.dispo, 0);
      s2[dp].taux += m2.taux;
    });
    return Object.values(s2)
      .map((x2) => ({
        dept: x2.dept,
        n: x2.n,
        dispo: x2.dispo,
        tauxM: Math.round(x2.taux / x2.n),
      }))
      .sort((x1, x2) => x2.dispo - x1.dispo);
  }, [flt]);
  var simRows = (0, Q.useMemo)(() => {
    if (!simu) return null;
    return calc.map((m2) => {
      var fin = m2.dispo,
        rep2 =
          fin > 0
            ? pol.politique === `integrale`
              ? fin
              : pol.politique === `plafond`
                ? Math.min(fin, Number(pol.plafond) || 0)
                : 0
            : 0,
        dr2 = sldDroit(m2.emp, AN + 1, P);
      return {
        emp: m2.emp,
        fin: fin,
        rep: rep2,
        droit: dr2.droit,
        prorata: dr2.prorata,
        ouvert: dr2.droit + rep2,
      };
    });
  }, [simu, pol, calc, P]);
  var sparkData = (0, Q.useMemo)(() => {
    if (!detail) return null;
    var FER = sldFset(),
      cum = 0,
      pts = [],
      an = exo === `tous` ? AN : parseInt(exo, 10);
    for (var mo = 1; mo <= 12; mo++) {
      detail.dems.forEach((q2) => {
        if (q2.statut !== `approuvee`) return;
        var d = new Date(q2.date_debut);
        if (d.getFullYear() === an && d.getMonth() === mo - 1)
          cum += sldOuvrables(q2.date_debut, q2.date_fin, FER);
      });
      pts.push(cum);
    }
    return pts;
  }, [detail, exo]);
  var jRestants = Math.max(
    0,
    Math.ceil((new Date(AN, 11, 31) - new Date()) / 864e5),
  );
  var fExport = () => {
    var entetes = [
        `Matricule`,
        `Employé`,
        `Département`,
        `Poste`,
        `Catégorie`,
        `Exercice`,
        `Droit (j)`,
        `Dont report N-1`,
        `Pris (j ouvr.)`,
        `En attente (j ouvr.)`,
        `Ajustements (j)`,
        `Solde disponible (j)`,
        `Solde projeté (j)`,
        `Taux (%)`,
        `Statut`,
        `Alerte`,
        `Report restant (j)`,
        `Échéance art. 89`,
        `Indemnité compensatrice (FCFA)`,
      ],
      lignes = srt.map((m2) => {
        var st = sldStatut(m2, P),
          al =
            st.key === `critique`
              ? `Dépassement projeté — arbitrage requis`
              : st.key === `sousUtilise`
                ? `Non-consommation — risque légal/burn-out`
                : st.key === `tendu`
                  ? `Taux élevé — couverture à surveiller`
                  : ``;
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
          m2.aj || 0,
          m2.dispo,
          m2.prev,
          m2.taux,
          st.label,
          al,
          m2.ech ? m2.ech.restant : 0,
          m2.ech ? m2.ech.echeance : ``,
          Math.round(sldIndemnite(m2, P)),
        ]
          .map((x2) => `"${String(x2 == null ? `` : x2).replace(/"/g, `""`)}"`)
          .join(`;`);
      }),
      csv =
        `﻿` +
        entetes.join(`;`) +
        `
` +
        lignes.join(`
`),
      bl = new Blob([csv], { type: `text/csv;charset=utf-8;` }),
      ur = URL.createObjectURL(bl),
      an2 = document.createElement(`a`);
    ((an2.href = ur),
      (an2.download = `soldes_conges_${exo}_${new Date().toISOString().slice(0, 10)}.csv`),
      an2.click(),
      URL.revokeObjectURL(ur));
    setSnack({
      msg:
        srt.length + ` solde(s) exporté(s) en CSV (décompte jours ouvrables)`,
      sev: `success`,
    });
  };
  var fRefresh = () => {
    ((SLD_FSET = null),
      setSync(new Date()),
      setTick(tick + 1),
      setSnack({
        msg: `Soldes recalculés depuis les demandes de congés (source : Congés Annuels V2)`,
        sev: `success`,
      }));
  };
  var fAdjOpen = (m) => {
    (setAdjF({ type: `recuperation`, sens: 1, jours: 1, motif: `` }),
      setAdj(m));
  };
  var fAjustSubmit = () => {
    if (!adj) return;
    var jours = Math.abs(Number(adjF.jours) || 0);
    if (!jours || jours > 60) {
      setSnack({ msg: `Nombre de jours invalide (0,5 à 60)`, sev: `error` });
      return;
    }
    if (!adjF.motif || adjF.motif.trim().length < 3) {
      setSnack({
        msg: `Motif obligatoire (3 caractères minimum) — traçabilité d'audit`,
        sev: `error`,
      });
      return;
    }
    var signe =
        adjF.type === `recuperation`
          ? 1
          : adjF.type === `sans_solde`
            ? -1
            : Number(adjF.sens) || 1,
      st = sld3Store();
    st.ajust.push({
      id: `adj-` + Date.now(),
      ts: new Date().toISOString(),
      auteur: roleAct,
      emp_id: adj.emp.id,
      emp_nom: B(adj.emp),
      annee: exo === `tous` ? AN : parseInt(exo, 10),
      type: adjF.type,
      jours: signe * jours,
      motif: adjF.motif.trim(),
    });
    sld3Write(st);
    var nv = adj.dispo + signe * jours;
    (setAdj(null),
      setDetail(adj.emp.id),
      setTick(tick + 1),
      setSnack({
        msg:
          `Ajustement enregistré (` +
          (signe > 0 ? `+` : `-`) +
          jours +
          ` j) — nouveau solde ` +
          nv +
          ` j`,
        sev: `success`,
      }));
  };
  var fParSave = () => {
    var st = sld3Store();
    ((st.meta.parametres = P),
      sld3Write(st),
      setPar(0),
      setTick(tick + 1),
      setSnack({
        msg: `Paramètres enregistrés — cockpit recalculé`,
        sev: `success`,
      }));
  };
  var fSimExport = () => {
    if (!simRows) return;
    var ent = [
        `Matricule`,
        `Employé`,
        `Département`,
        `Solde fin ` + AN + ` (j)`,
        `Report simulé vers ` + (AN + 1) + ` (j)`,
        `Droit ` + (AN + 1) + ` (j)`,
        `Solde d'ouverture ` + (AN + 1) + ` (j)`,
      ],
      lig = simRows.map((r2) =>
        [
          r2.emp.matricule || ``,
          B(r2.emp),
          r2.emp.departement || ``,
          r2.fin,
          r2.rep,
          r2.droit,
          r2.ouvert,
        ]
          .map((x2) => `"${String(x2 == null ? `` : x2).replace(/"/g, `""`)}"`)
          .join(`;`),
      ),
      bl = new Blob(["\uFEFF" + ent.join(`;`) + "\n" + lig.join("\n")], {
        type: `text/csv;charset=utf-8;`,
      }),
      ur = URL.createObjectURL(bl),
      an2 = document.createElement(`a`);
    ((an2.href = ur),
      (an2.download = `simulation_cloture_${AN}_${AN + 1}.csv`),
      an2.click(),
      URL.revokeObjectURL(ur));
    setSnack({ msg: `Simulation de clôture exportée`, sev: `success` });
  };
  var fJrnExport = () => {
    var ent = [
        `Horodatage`,
        `Auteur (rôle)`,
        `Employé`,
        `Exercice`,
        `Type d'ajustement`,
        `Jours (signés)`,
        `Motif`,
      ],
      lig = journal.map((x2) =>
        [
          x2.ts,
          x2.auteur,
          x2.emp_nom,
          x2.annee,
          (SLD3_AJUST_TYPES[x2.type] || [x2.type])[0],
          x2.jours,
          x2.motif,
        ]
          .map((x3) => `"${String(x3 == null ? `` : x3).replace(/"/g, `""`)}"`)
          .join(`;`),
      ),
      bl = new Blob(["\uFEFF" + ent.join(`;`) + "\n" + lig.join("\n")], {
        type: `text/csv;charset=utf-8;`,
      }),
      ur = URL.createObjectURL(bl),
      an2 = document.createElement(`a`);
    ((an2.href = ur),
      (an2.download = `journal_ajustements_soldes_${new Date().toISOString().slice(0, 10)}.csv`),
      an2.click(),
      URL.revokeObjectURL(ur));
    setSnack({
      msg: `Journal d'audit exporté (${journal.length} mouvement(s))`,
      sev: `success`,
    });
  };
  var fTri = (key) =>
    setTri((tr) => ({
      key: key,
      dir: tr.key === key && tr.dir === `asc` ? `desc` : `asc`,
    }));
  var fTh = (label, key, align) =>
    (0, $.jsx)(
      v,
      {
        align: align || `left`,
        sx: {
          fontWeight: 700,
          whiteSpace: `nowrap`,
          bgcolor: `background.default`,
        },
        children: (0, $.jsxs)(a, {
          sx: {
            display: `inline-flex`,
            alignItems: `center`,
            gap: 0.5,
            cursor: `pointer`,
            userSelect: `none`,
            "&:hover": { color: `primary.main` },
          },
          onClick: () => fTri(key),
          children: [
            label,
            tri.key === key
              ? (0, $.jsx)(tri.dir === `asc` ? AU : AD, {
                  sx: { fontSize: 15, color: `primary.main` },
                })
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
        (0, $.jsx)(c, {
          severity: `info`,
          sx: { mb: 2.5, fontWeight: 600 },
          children: `Vue salarié — vous consultez uniquement votre propre situation (confidentialité RGPD).`,
        }),
        (0, $.jsx)(J, {
          title: `Mon solde de congés`,
          subtitle:
            `Exercice ` +
            (exo === `tous` ? `tous exercices` : exo) +
            ` · décompte en jours ouvrables (fériés Cameroun déduits)`,
          action: (0, $.jsx)(l, {
            variant: `outlined`,
            size: `small`,
            startIcon: (0, $.jsx)(RF, {}),
            onClick: fRefresh,
            sx: { textTransform: `none`, fontSize: `0.75rem` },
            children: `Actualiser`,
          }),
        }),
        (0, $.jsxs)(ee, {
          sx: { mt: 2, borderRadius: 3 },
          children: [
            (0, $.jsxs)(u, {
              children: [
                (0, $.jsxs)(o, {
                  direction: `row`,
                  spacing: 2,
                  alignItems: `center`,
                  sx: { mb: 2 },
                  children: [
                    sldAvatar(mo.emp, 56, 22),
                    (0, $.jsxs)(a, {
                      children: [
                        (0, $.jsx)(i, {
                          variant: `h6`,
                          fontWeight: 800,
                          children: B(mo.emp),
                        }),
                        (0, $.jsx)(i, {
                          variant: `body2`,
                          color: `text.secondary`,
                          children:
                            (mo.emp.poste || ``) +
                            ` · ` +
                            (mo.emp.departement || ``) +
                            ` · ` +
                            (mo.emp.matricule || ``),
                        }),
                      ],
                    }),
                    (0, $.jsx)(a, {
                      sx: { ml: `auto` },
                      children: sldChipStatut(mo, P),
                    }),
                  ],
                }),
                sldAlertePerso(mo, P),
                mo.ech && !mo.ech.expire
                  ? (0, $.jsx)(c, {
                      severity: `warning`,
                      icon: (0, $.jsx)(GVL, {}),
                      sx: { mb: 2, fontWeight: 600 },
                      children:
                        mo.ech.restant +
                        ` j de report expirent le ` +
                        mo.ech.echeance +
                        ` (` +
                        mo.ech.jrest +
                        ` jour(s) restants) — les congés doivent être pris dans les 12 mois (art. 89 CT). Pensez à les consommer.`,
                    })
                  : null,
                (0, $.jsxs)(a, {
                  sx: {
                    display: `grid`,
                    gridTemplateColumns: `repeat(auto-fit,minmax(130px,1fr))`,
                    gap: 1.5,
                  },
                  children: [
                    (0, $.jsx)(SldTuile, {
                      label: `Droit annuel`,
                      valeur: mo.droit + ` j`,
                    }),
                    (0, $.jsx)(SldTuile, {
                      label: `Report N-1`,
                      valeur: `+` + mo.report + ` j`,
                    }),
                    (0, $.jsx)(SldTuile, {
                      label: `Pris (ouvrables)`,
                      valeur: mo.pris + ` j`,
                    }),
                    (0, $.jsx)(SldTuile, {
                      label: `En attente`,
                      valeur: mo.att + ` j`,
                      couleur: mo.att > 0 ? `warning.main` : null,
                    }),
                    (0, $.jsx)(SldTuile, {
                      label: `Disponible`,
                      valeur: mo.dispo + ` j`,
                      couleur: mo.dispo < 0 ? `error.main` : `success.main`,
                    }),
                    (0, $.jsx)(SldTuile, {
                      label: `Projection si accord`,
                      valeur: mo.prev + ` j`,
                      couleur: mo.prev < 0 ? `error.main` : `text.primary`,
                    }),
                    (0, $.jsx)(SldTuile, {
                      label: `Ajustements RH`,
                      valeur: sldSigne(mo.aj || 0) + ` j`,
                      couleur: mo.aj ? `secondary.main` : null,
                    }),
                  ],
                }),
                (0, $.jsx)(a, {
                  sx: { mt: 2 },
                  children: sldBarre(
                    mo.taux,
                    mo.taux > 75
                      ? `error.main`
                      : mo.taux < 40
                        ? `warning.main`
                        : `success.main`,
                  ),
                }),
                (0, $.jsx)(i, {
                  variant: `subtitle2`,
                  sx: { mt: 2.5, mb: 1, fontWeight: 800 },
                  children:
                    `Mes congés annuels ` +
                    (exo === `tous` ? `(tous exercices)` : exo) +
                    ` — ` +
                    mo.dems.length +
                    ` demande(s)`,
                }),
                mo.dems.length === 0
                  ? (0, $.jsx)(i, {
                      variant: `body2`,
                      color: `text.secondary`,
                      children: `Aucune demande de congé annuel sur cet exercice.`,
                    })
                  : (0, $.jsx)(a, {
                      sx: { display: `flex`, flexDirection: `column`, gap: 1 },
                      children: mo.dems
                        .slice()
                        .sort((p2, q2) =>
                          p2.date_debut < q2.date_debut ? 1 : -1,
                        )
                        .map((q2) =>
                          (0, $.jsxs)(
                            a,
                            {
                              sx: {
                                display: `flex`,
                                alignItems: `center`,
                                gap: 1.5,
                                p: 1,
                                borderRadius: 2,
                                border: `1px solid`,
                                borderColor: `divider`,
                              },
                              children: [
                                (0, $.jsx)(CT, {
                                  sx: { fontSize: 18, color: `primary.main` },
                                }),
                                (0, $.jsxs)(i, {
                                  variant: `body2`,
                                  fontWeight: 700,
                                  children: [
                                    q2.leave_number || `—`,
                                    ` · `,
                                    A(q2.date_debut),
                                    ` → `,
                                    A(q2.date_fin),
                                  ],
                                }),
                                (0, $.jsx)(i, {
                                  variant: `caption`,
                                  color: `text.secondary`,
                                  children:
                                    sldOuvrables(
                                      q2.date_debut,
                                      q2.date_fin,
                                      sldFset(),
                                    ) + ` j ouvrables`,
                                }),
                                (0, $.jsx)(a, {
                                  sx: { ml: `auto` },
                                  children: sldChipDemande(q2.statut),
                                }),
                              ],
                            },
                            q2.id,
                          ),
                        ),
                    }),
                (0, $.jsx)(o, {
                  direction: `row`,
                  spacing: 1.5,
                  sx: { mt: 2.5 },
                  children: (0, $.jsx)(l, {
                    variant: `contained`,
                    size: `small`,
                    startIcon: (0, $.jsx)(CT, {}),
                    onClick: () =>
                      nav(`/domaine2_Gestion_Administrative_Personnel/conges`),
                    sx: {
                      textTransform: `none`,
                      fontSize: `0.75rem`,
                      bgcolor: `#7e3ff2`,
                    },
                    children: `Poser un congé / voir mes demandes`,
                  }),
                }),
              ],
            }),
          ],
        }),
        (0, $.jsx)(d, {
          open: !!snack,
          autoHideDuration: 4e3,
          onClose: () => setSnack(null),
          anchorOrigin: { vertical: `bottom`, horizontal: `center` },
          message: snack ? snack.msg : ``,
        }),
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
        subtitle:
          `Exercice ` +
          (exo === `tous` ? `tous exercices confondus` : exo) +
          ` · décompte en jours ouvrables (week-ends et fériés Cameroun déduits) · synchronisé en temps réel avec les demandes de Congés Annuels`,
        sx: {
          "& .MuiCardHeader-action": {
            flexWrap: `wrap`,
            maxWidth: { xs: `56%`, sm: `none` },
            rowGap: 1,
          },
        },
        action: (0, $.jsxs)(o, {
          direction: `row`,
          spacing: 1,
          alignItems: `center`,
          sx: {
            flexWrap: `wrap`,
            justifyContent: { xs: `flex-start`, sm: `flex-end` },
            rowGap: 1,
          },
          children: [
            (0, $.jsxs)(l, {
              variant: `outlined`,
              size: `small`,
              onClick: () => setSimu(1),
              sx: {
                textTransform: `none`,
                fontSize: `0.75rem`,
                minWidth: 0,
                px: { xs: 1, sm: 1.5 },
              },
              children: [
                (0, $.jsx)(AT, { sx: { fontSize: 18 } }),
                (0, $.jsx)(i, {
                  component: `span`,
                  sx: {
                    display: { xs: `none`, lg: `inline` },
                    fontSize: `inherit`,
                  },
                  children: `Simulateur`,
                }),
              ],
            }),
            (0, $.jsxs)(l, {
              variant: `outlined`,
              size: `small`,
              onClick: () => setJrn(1),
              sx: {
                textTransform: `none`,
                fontSize: `0.75rem`,
                minWidth: 0,
                px: { xs: 1, sm: 1.5 },
              },
              children: [
                (0, $.jsx)(HIS, { sx: { fontSize: 18 } }),
                (0, $.jsx)(i, {
                  component: `span`,
                  sx: {
                    display: { xs: `none`, lg: `inline` },
                    fontSize: `inherit`,
                  },
                  children:
                    `Journal` +
                    (journal.length ? ` (` + journal.length + `)` : ``),
                }),
              ],
            }),
            (0, $.jsx)(E, {
              title: `Paramètres du cockpit (seuils, bases, coûts)`,
              children: (0, $.jsx)(r, {
                size: `small`,
                onClick: () => setPar(1),
                children: (0, $.jsx)(TUNE, { sx: { fontSize: 20 } }),
              }),
            }),
            (0, $.jsx)(i, {
              variant: `caption`,
              sx: {
                color: `text.secondary`,
                display: { xs: `none`, md: `block` },
              },
              children: `Synchro ` + sync.toLocaleTimeString(),
            }),
            (0, $.jsxs)(l, {
              variant: `outlined`,
              size: `small`,
              onClick: fRefresh,
              sx: {
                textTransform: `none`,
                fontSize: `0.75rem`,
                minWidth: 0,
                px: { xs: 1, sm: 1.5 },
              },
              children: [
                (0, $.jsx)(RF, { sx: { fontSize: 18 } }),
                (0, $.jsx)(i, {
                  component: `span`,
                  sx: {
                    display: { xs: `none`, sm: `inline` },
                    fontSize: `inherit`,
                  },
                  children: `Actualiser`,
                }),
              ],
            }),
            (0, $.jsxs)(l, {
              variant: `outlined`,
              size: `small`,
              onClick: fExport,
              sx: {
                textTransform: `none`,
                fontSize: `0.75rem`,
                minWidth: 0,
                px: { xs: 1, sm: 1.5 },
              },
              children: [
                (0, $.jsx)(S, { sx: { fontSize: 18 } }),
                (0, $.jsx)(i, {
                  component: `span`,
                  sx: {
                    display: { xs: `none`, sm: `inline` },
                    fontSize: `inherit`,
                  },
                  children: `Export CSV`,
                }),
              ],
            }),
          ],
        }),
      }),
      kpi.crit > 0
        ? (0, $.jsx)(c, {
            severity: `error`,
            icon: (0, $.jsx)(w, {}),
            sx: {
              fontWeight: 600,
              overflowWrap: `anywhere`,
              "& .MuiAlert-action": { display: { xs: `none`, sm: `flex` } },
            },
            action: (0, $.jsx)(l, {
              color: `error`,
              size: `small`,
              onClick: () => setStatutF(`critique`),
              sx: { textTransform: `none` },
              children: `Examiner`,
            }),
            children:
              kpi.crit +
              ` employé(s) dépasseraient leur solde si les demandes en attente étaient approuvées — arbitrage DRH requis (refus motivé, report ou ajustement).`,
          })
        : null,
      kpi.sousU > 0
        ? (0, $.jsx)(c, {
            severity: `warning`,
            sx: {
              fontWeight: 600,
              overflowWrap: `anywhere`,
              "& .MuiAlert-action": { display: { xs: `none`, sm: `flex` } },
            },
            action: (0, $.jsx)(l, {
              color: `warning`,
              size: `small`,
              onClick: () => setStatutF(`sousUtilise`),
              sx: { textTransform: `none` },
              children: `Voir`,
            }),
            children:
              kpi.sousU +
              ` employé(s) sous 40 % de consommation ` +
              (exo === `tous` ? `` : exo) +
              ` — obligation légale de repos (art. 89 et s. Code du travail) · ` +
              jRestants +
              ` jour(s) avant le 31/12 : anticipez la planification.`,
          })
        : null,
      kpi.expN > 0
        ? (0, $.jsx)(c, {
            severity: `warning`,
            icon: (0, $.jsx)(GVL, {}),
            sx: {
              fontWeight: 600,
              overflowWrap: `anywhere`,
              "& .MuiAlert-action": { display: { xs: `none`, sm: `flex` } },
            },
            action: (0, $.jsx)(l, {
              color: `warning`,
              size: `small`,
              onClick: () => setEche(echeF === `echoire` ? `tous` : `echoire`),
              sx: { textTransform: `none` },
              children: `Examiner`,
            }),
            children:
              `Échéance art. 89 : ` +
              kpi.expN +
              ` employé(s) portent ` +
              kpi.expJ +
              ` j de droits à échoir au 31/12/` +
              AN +
              ` (congés à prendre dans les 12 mois) — ` +
              jRestants +
              ` j restants avant la fin d'exercice.`,
          })
        : null,
      (0, $.jsxs)(a, {
        sx: {
          display: `grid`,
          gridTemplateColumns: { xs: `1fr 1fr`, md: `repeat(4,1fr)` },
          gap: 2,
        },
        children: [
          (0, $.jsx)(SldKpi, {
            ic: AB,
            grad: !0,
            valeur: kpi.tot + ` j`,
            label: `Solde total disponible`,
            sub: `≈ provision ` + sldFCFA(kpi.prov),
            actif: statutF === `tous` && dept === `tous` && !rech,
            onClic: () => {
              (setStatutF(`tous`), setDept(`tous`), setRech(``), setPage(0));
            },
          }),
          (0, $.jsx)(SldKpi, {
            ic: w,
            couleur: `error.main`,
            valeur: String(kpi.crit),
            label: `Alertes critiques`,
            sub: `solde projeté négatif`,
            actif: statutF === `critique`,
            onClic: () => (
              setStatutF(statutF === `critique` ? `tous` : `critique`),
              setPage(0)
            ),
          }),
          (0, $.jsx)(SldKpi, {
            ic: AT,
            couleur: `warning.main`,
            valeur: String(kpi.sousU),
            label: `Sous-utilisés`,
            sub: `< 40 % consommé — risque légal`,
            actif: statutF === `sousUtilise`,
            onClic: () => (
              setStatutF(statutF === `sousUtilise` ? `tous` : `sousUtilise`),
              setPage(0)
            ),
          }),
          (0, $.jsx)(SldKpi, {
            ic: AS2,
            couleur: `success.main`,
            valeur: kpi.tauxMoy + ` %`,
            label: `Taux moyen d'utilisation`,
            sub: srt.length + ` employé(s) affiché(s)`,
            actif: !1,
            onClic: () => fTri(`taux`),
          }),
        ],
      }),
      (0, $.jsxs)(a, {
        sx: {
          display: `flex`,
          gap: 1.5,
          flexWrap: `wrap`,
          alignItems: `center`,
        },
        children: [
          (0, $.jsx)(D, {
            size: `small`,
            placeholder: `Rechercher (nom, matricule, département…)`,
            value: rech,
            onChange: (e2) => {
              (setRech(e2.target.value), setPage(0));
            },
            InputProps: {
              startAdornment: (0, $.jsx)(k, {
                sx: { fontSize: 18, mr: 1, color: `text.secondary` },
              }),
            },
            sx: {
              flex: 1,
              minWidth: 160,
              "& .MuiInput-root": { fontSize: `0.8rem` },
            },
          }),
          (0, $.jsxs)(D, {
            select: !0,
            size: `small`,
            label: `Statut`,
            value: statutF,
            onChange: (e2) => {
              (setStatutF(e2.target.value), setPage(0));
            },
            sx: { minWidth: 150, width: { xs: `100%`, sm: `auto` } },
            children: [
              (0, $.jsx)(s, { value: `tous`, children: `Tous les statuts` }),
              (0, $.jsx)(s, { value: `critique`, children: `🔴 Critique` }),
              (0, $.jsx)(s, { value: `tendu`, children: `🟠 Tendu (> 75 %)` }),
              (0, $.jsx)(s, { value: `sain`, children: `🟢 Sain (40-75 %)` }),
              (0, $.jsx)(s, {
                value: `sousUtilise`,
                children: `🔵 Sous-utilisé (< 40 %)`,
              }),
            ],
          }),
          (0, $.jsxs)(D, {
            select: !0,
            size: `small`,
            label: `Exercice`,
            value: exo,
            onChange: (e2) => {
              (setExo(e2.target.value), setPage(0));
            },
            sx: { minWidth: 150, width: { xs: `100%`, sm: `auto` } },
            children: [
              (0, $.jsx)(s, { value: String(AN), children: `Exercice ` + AN }),
              (0, $.jsx)(s, {
                value: String(AN - 1),
                children: `Exercice ` + (AN - 1),
              }),
              (0, $.jsx)(s, {
                value: String(AN - 2),
                children: `Exercice ` + (AN - 2),
              }),
              (0, $.jsx)(s, { value: `tous`, children: `Tous exercices` }),
            ],
          }),
          (0, $.jsxs)(D, {
            select: !0,
            size: `small`,
            label: `Échéance art. 89`,
            value: echeF,
            onChange: (e2) => {
              (setEche(e2.target.value), setPage(0));
            },
            sx: { minWidth: 160, width: { xs: `100%`, sm: `auto` } },
            children: [
              (0, $.jsx)(s, { value: `tous`, children: `Toutes échéances` }),
              (0, $.jsx)(s, {
                value: `echoire`,
                children: `⏳ À échoir (< 90 j)`,
              }),
              (0, $.jsx)(s, { value: `expiree`, children: `🔴 Expirées` }),
            ],
          }),
          dept !== `tous` || statutF !== `tous` || rech || echeF !== `tous`
            ? (0, $.jsx)(l, {
                size: `small`,
                onClick: () => {
                  (setDept(`tous`),
                    setStatutF(`tous`),
                    setRech(``),
                    setEche(`tous`),
                    setPage(0));
                },
                sx: { textTransform: `none`, fontSize: `0.75rem` },
                children: `Effacer les filtres`,
              })
            : null,
        ],
      }),
      (0, $.jsx)(a, {
        sx: { display: `flex`, gap: 0.75, flexWrap: `wrap`, mb: -0.5 },
        children: [
          (0, $.jsx)(T, {
            label: `Tous départements`,
            size: `small`,
            onClick: () => (setDept(`tous`), setPage(0)),
            color: dept === `tous` ? `primary` : `default`,
            variant: dept === `tous` ? `filled` : `outlined`,
            sx: { fontWeight: 700, fontSize: `0.72rem`, cursor: `pointer` },
          }),
          depts.map((dp) =>
            (0, $.jsx)(
              T,
              {
                label: dp,
                size: `small`,
                onClick: () => (setDept(dept === dp ? `tous` : dp), setPage(0)),
                color: dept === dp ? `primary` : `default`,
                variant: dept === dp ? `filled` : `outlined`,
                sx: { fontWeight: 700, fontSize: `0.72rem`, cursor: `pointer` },
              },
              dp,
            ),
          ),
        ],
      }),
      (0, $.jsx)(ee, {
        sx: { borderRadius: 3 },
        children: (0, $.jsxs)(u, {
          children: [
            (0, $.jsxs)(a, {
              sx: {
                display: `flex`,
                alignItems: `center`,
                gap: 1,
                mb: chOpen ? 1.5 : 0,
              },
              children: [
                (0, $.jsx)(AS2, { sx: { fontSize: 20, color: `#7e3ff2` } }),
                (0, $.jsx)(i, {
                  variant: `subtitle2`,
                  fontWeight: 800,
                  children: `Pilotage visuel`,
                }),
                (0, $.jsx)(a, {
                  sx: { ml: `auto` },
                  children: (0, $.jsx)(l, {
                    size: `small`,
                    onClick: () => setCh(chOpen ? 0 : 1),
                    sx: {
                      textTransform: `none`,
                      fontSize: `0.72rem`,
                      minWidth: 0,
                    },
                    children: chOpen ? `Masquer` : `Afficher`,
                  }),
                }),
              ],
            }),
            chOpen
              ? (0, $.jsxs)(a, {
                  sx: {
                    display: `grid`,
                    gridTemplateColumns: { xs: `1fr`, md: `1fr 1fr` },
                    gap: 2.5,
                    overflowX: `auto`,
                  },
                  children: [
                    (0, $.jsxs)(a, {
                      children: [
                        (0, $.jsx)(i, {
                          variant: `caption`,
                          fontWeight: 800,
                          sx: {
                            color: `text.secondary`,
                            display: `block`,
                            mb: 1,
                          },
                          children:
                            `Répartition des statuts — ` +
                            flt.length +
                            ` employé(s) affiché(s)`,
                        }),
                        (0, $.jsx)(a, {
                          sx: {
                            display: `flex`,
                            flexDirection: `column`,
                            gap: 1,
                          },
                          children: [
                            {
                              k: `critique`,
                              l: `Critique`,
                              c: `error.main`,
                              n: chStats.critique,
                            },
                            {
                              k: `tendu`,
                              l: `Tendu`,
                              c: `warning.main`,
                              n: chStats.tendu,
                            },
                            {
                              k: `sain`,
                              l: `Sain`,
                              c: `success.main`,
                              n: chStats.sain,
                            },
                            {
                              k: `sousUtilise`,
                              l: `Sous-utilisé`,
                              c: `info.main`,
                              n: chStats.sousUtilise,
                            },
                          ].map((x2) =>
                            (0, $.jsxs)(
                              a,
                              {
                                sx: {
                                  display: `flex`,
                                  alignItems: `center`,
                                  gap: 1,
                                },
                                children: [
                                  (0, $.jsx)(a, {
                                    sx: { width: 86, flexShrink: 0 },
                                    children: (0, $.jsx)(i, {
                                      variant: `caption`,
                                      fontWeight: 700,
                                      children: x2.l,
                                    }),
                                  }),
                                  (0, $.jsx)(a, {
                                    sx: {
                                      flex: 1,
                                      height: 10,
                                      borderRadius: 5,
                                      bgcolor: `action.hover`,
                                      overflow: `hidden`,
                                    },
                                    children: (0, $.jsx)(a, {
                                      sx: {
                                        width:
                                          (flt.length
                                            ? Math.round(
                                                (x2.n / flt.length) * 100,
                                              )
                                            : 0) + `%`,
                                        height: `100%`,
                                        bgcolor: x2.c,
                                      },
                                    }),
                                  }),
                                  (0, $.jsx)(i, {
                                    variant: `caption`,
                                    fontWeight: 800,
                                    sx: { width: 22, textAlign: `right` },
                                    children: String(x2.n),
                                  }),
                                ],
                              },
                              x2.k,
                            ),
                          ),
                        }),
                      ],
                    }),
                    (0, $.jsxs)(a, {
                      children: [
                        (0, $.jsx)(i, {
                          variant: `caption`,
                          fontWeight: 800,
                          sx: {
                            color: `text.secondary`,
                            display: `block`,
                            mb: 1,
                          },
                          children: `Santé par département — taux moyen d'utilisation, cliquez pour filtrer`,
                        }),
                        (0, $.jsx)(a, {
                          sx: {
                            display: `flex`,
                            flexDirection: `column`,
                            gap: 0.75,
                            maxHeight: 180,
                            overflowY: `auto`,
                          },
                          children: chDepts.map((x2) =>
                            (0, $.jsxs)(
                              a,
                              {
                                onClick: () => (
                                  setDept(dept === x2.dept ? `tous` : x2.dept),
                                  setPage(0)
                                ),
                                sx: {
                                  display: `flex`,
                                  alignItems: `center`,
                                  gap: 1,
                                  cursor: `pointer`,
                                  p: 0.5,
                                  borderRadius: 1,
                                  "&:hover": { bgcolor: `action.hover` },
                                },
                                children: [
                                  (0, $.jsx)(T, {
                                    label: x2.dept,
                                    size: `small`,
                                    variant:
                                      dept === x2.dept ? `filled` : `outlined`,
                                    color:
                                      dept === x2.dept ? `primary` : `default`,
                                    sx: {
                                      fontWeight: 700,
                                      fontSize: `0.65rem`,
                                      minWidth: 90,
                                    },
                                  }),
                                  (0, $.jsx)(i, {
                                    variant: `caption`,
                                    sx: {
                                      width: 84,
                                      flexShrink: 0,
                                      color: `text.secondary`,
                                    },
                                    children:
                                      x2.n + ` emp · ` + x2.dispo + ` j`,
                                  }),
                                  (0, $.jsx)(a, {
                                    sx: {
                                      flex: 1,
                                      height: 8,
                                      borderRadius: 4,
                                      bgcolor: `action.hover`,
                                      overflow: `hidden`,
                                    },
                                    children: (0, $.jsx)(a, {
                                      sx: {
                                        width: Math.min(x2.tauxM, 100) + `%`,
                                        height: `100%`,
                                        bgcolor:
                                          x2.tauxM > 75
                                            ? `error.main`
                                            : x2.tauxM < 40
                                              ? `warning.main`
                                              : `success.main`,
                                      },
                                    }),
                                  }),
                                  (0, $.jsx)(i, {
                                    variant: `caption`,
                                    fontWeight: 800,
                                    children: x2.tauxM + `%`,
                                  }),
                                ],
                              },
                              x2.dept,
                            ),
                          ),
                        }),
                      ],
                    }),
                  ],
                })
              : null,
          ],
        }),
      }),
      (0, $.jsx)(ee, {
        children: (0, $.jsxs)(u, {
          children: [
            (0, $.jsx)(y, {
              sx: { overflowX: `auto`, maxWidth: `100%` },
              children: (0, $.jsxs)(ne, {
                size: `small`,
                stickyHeader: !0,
                children: [
                  (0, $.jsx)(te, {
                    children: (0, $.jsxs)(b, {
                      children: [
                        fTh(`Employé`, `employe`),
                        fTh(`Département`, `dept`),
                        fTh(`Droit annuel`, `droit`, `right`),
                        fTh(`Pris (ouvr.)`, `pris`, `right`),
                        fTh(`En attente`, `att`, `right`),
                        fTh(`Solde disponible`, `dispo`, `right`),
                        fTh(`Taux`, `taux`),
                        (0, $.jsx)(v, {
                          sx: { fontWeight: 700 },
                          children: `Statut`,
                        }),
                        fTh(`Échéance 89`, `eche`),
                        (0, $.jsx)(v, {
                          align: `center`,
                          sx: { fontWeight: 700 },
                          children: `Actions`,
                        }),
                      ],
                    }),
                  }),
                  (0, $.jsx)(_, {
                    children: srt
                      .slice(page * pp, page * pp + pp)
                      .map((m2, idx) =>
                        (0, $.jsxs)(
                          b,
                          {
                            hover: !0,
                            onClick: () => setDetail(m2.emp.id),
                            sx: { cursor: `pointer` },
                            children: [
                              (0, $.jsxs)(v, {
                                children: [
                                  (0, $.jsxs)(a, {
                                    sx: {
                                      display: `flex`,
                                      alignItems: `center`,
                                      gap: 1.2,
                                    },
                                    children: [
                                      sldAvatar(m2.emp, 34, 12),
                                      (0, $.jsxs)(a, {
                                        sx: { minWidth: 0 },
                                        children: [
                                          (0, $.jsx)(i, {
                                            variant: `body2`,
                                            fontWeight: 700,
                                            noWrap: !0,
                                            children: B(m2.emp),
                                          }),
                                          (0, $.jsx)(i, {
                                            variant: `caption`,
                                            sx: {
                                              color: `text.secondary`,
                                              fontFamily: `monospace`,
                                            },
                                            children: m2.emp.matricule || ``,
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              (0, $.jsx)(v, {
                                children: (0, $.jsx)(T, {
                                  label: m2.emp.departement || `—`,
                                  size: `small`,
                                  variant: `outlined`,
                                  sx: { fontSize: `0.68rem`, fontWeight: 700 },
                                }),
                              }),
                              (0, $.jsxs)(v, {
                                align: `right`,
                                children: [
                                  m2.droit + ` j`,
                                  m2.prorata
                                    ? (0, $.jsx)(i, {
                                        variant: `caption`,
                                        sx: {
                                          display: `block`,
                                          color: `info.main`,
                                          fontWeight: 700,
                                        },
                                        children: `prorata embauche`,
                                      })
                                    : null,
                                  m2.report > 0
                                    ? (0, $.jsx)(i, {
                                        variant: `caption`,
                                        sx: {
                                          display: `block`,
                                          color: `secondary.main`,
                                          fontWeight: 700,
                                        },
                                        children:
                                          `dont report +` + m2.report + ` j`,
                                      })
                                    : null,
                                ],
                              }),
                              (0, $.jsx)(v, {
                                align: `right`,
                                children: (0, $.jsx)(i, {
                                  variant: `body2`,
                                  fontWeight: 700,
                                  children: m2.pris + ` j`,
                                }),
                              }),
                              (0, $.jsx)(v, {
                                align: `right`,
                                children:
                                  m2.att > 0
                                    ? (0, $.jsx)(T, {
                                        label: m2.att + ` j`,
                                        size: `small`,
                                        color: `warning`,
                                        variant: `outlined`,
                                        sx: {
                                          fontWeight: 800,
                                          fontSize: `0.7rem`,
                                        },
                                      })
                                    : (0, $.jsx)(i, {
                                        variant: `body2`,
                                        sx: { color: `text.secondary` },
                                        children: `0 j`,
                                      }),
                              }),
                              (0, $.jsxs)(v, {
                                align: `right`,
                                children: [
                                  (0, $.jsx)(i, {
                                    variant: `body2`,
                                    fontWeight: 800,
                                    sx: {
                                      color:
                                        m2.dispo < 0
                                          ? `error.main`
                                          : m2.dispo < 5
                                            ? `warning.main`
                                            : `success.main`,
                                    },
                                    children: m2.dispo + ` j`,
                                  }),
                                  m2.att > 0
                                    ? (0, $.jsx)(i, {
                                        variant: `caption`,
                                        sx: {
                                          display: `block`,
                                          color: `text.secondary`,
                                        },
                                        children: `projeté : ` + m2.prev + ` j`,
                                      })
                                    : null,
                                  m2.delta != null && m2.delta !== 0
                                    ? (0, $.jsx)(i, {
                                        variant: `caption`,
                                        sx: {
                                          display: `block`,
                                          fontWeight: 700,
                                          color:
                                            m2.delta > 0
                                              ? `success.main`
                                              : `error.main`,
                                        },
                                        children:
                                          (m2.delta > 0 ? `▲` : `▼`) +
                                          ` N-1 : ` +
                                          sldSigne(m2.delta) +
                                          ` j`,
                                      })
                                    : null,
                                ],
                              }),
                              (0, $.jsx)(v, {
                                children: sldBarre(
                                  m2.taux,
                                  m2.taux > 75
                                    ? `error.main`
                                    : m2.taux < 40
                                      ? `warning.main`
                                      : `success.main`,
                                ),
                              }),
                              (0, $.jsx)(v, { children: sldChipStatut(m2, P) }),
                              (0, $.jsx)(v, {
                                children: m2.ech
                                  ? (0, $.jsx)(E, {
                                      title:
                                        m2.ech.restant +
                                        ` j de report expirent le ` +
                                        m2.ech.echeance +
                                        ` (art. 89 CT — congés à prendre dans les 12 mois)`,
                                      children: (0, $.jsx)(T, {
                                        label: m2.ech.expire
                                          ? `Expiré`
                                          : `J-` + m2.ech.jrest,
                                        size: `small`,
                                        color: m2.ech.expire
                                          ? `error`
                                          : `warning`,
                                        variant: `outlined`,
                                        sx: {
                                          fontWeight: 800,
                                          fontSize: `0.68rem`,
                                        },
                                      }),
                                    })
                                  : (0, $.jsx)(i, {
                                      variant: `body2`,
                                      sx: { color: `text.disabled` },
                                      children: `—`,
                                    }),
                              }),
                              (0, $.jsx)(v, {
                                align: `center`,
                                children: (0, $.jsxs)(o, {
                                  direction: `row`,
                                  spacing: 0.5,
                                  justifyContent: `center`,
                                  children: [
                                    (0, $.jsx)(E, {
                                      title: `Détail du solde`,
                                      children: (0, $.jsx)(r, {
                                        size: `small`,
                                        color: `primary`,
                                        onClick: (e2) => (
                                          e2.stopPropagation(),
                                          setDetail(m2.emp.id)
                                        ),
                                        children: (0, $.jsx)(C, {
                                          fontSize: `small`,
                                        }),
                                      }),
                                    }),
                                    (0, $.jsx)(E, {
                                      title: `Voir ses demandes dans Congés Annuels`,
                                      children: (0, $.jsx)(r, {
                                        size: `small`,
                                        color: `secondary`,
                                        onClick: (e2) => (
                                          e2.stopPropagation(),
                                          nav(
                                            `/domaine2_Gestion_Administrative_Personnel/conges`,
                                          )
                                        ),
                                        children: (0, $.jsx)(CT, {
                                          fontSize: `small`,
                                        }),
                                      }),
                                    }),
                                  ],
                                }),
                              }),
                            ],
                          },
                          m2.emp.id || idx,
                        ),
                      ),
                  }),
                  srt.length === 0
                    ? (0, $.jsx)(b, {
                        children: (0, $.jsx)(v, {
                          colSpan: 10,
                          align: `center`,
                          sx: { py: 4, color: `text.secondary` },
                          children: `Aucun employé ne correspond aux filtres actifs`,
                        }),
                      })
                    : null,
                ],
              }),
            }),
            (0, $.jsx)(g, {
              component: `div`,
              count: srt.length,
              page: page,
              onPageChange: (e2, p2) => setPage(p2),
              rowsPerPage: pp,
              onRowsPerPageChange: (e2) => {
                (setPp(parseInt(e2.target.value)), setPage(0));
              },
              rowsPerPageOptions: [10, 20, 50],
              labelRowsPerPage: `Lignes:`,
              labelDisplayedRows: (pg2) =>
                pg2.from + `-` + pg2.to + ` sur ` + pg2.count,
              sx: { mt: 1 },
            }),
          ],
        }),
      }),
      (0, $.jsxs)(f, {
        open: !!detail,
        onClose: () => setDetail(null),
        maxWidth: `md`,
        fullWidth: !0,
        children: [
          detail
            ? (0, $.jsxs)(h, {
                sx: {
                  fontWeight: 800,
                  display: `flex`,
                  alignItems: `center`,
                  gap: 1.5,
                },
                children: [
                  sldAvatar(detail.emp, 44, 18),
                  (0, $.jsxs)(a, {
                    children: [
                      (0, $.jsx)(i, {
                        variant: `h6`,
                        fontWeight: 800,
                        children: B(detail.emp),
                      }),
                      (0, $.jsx)(i, {
                        variant: `caption`,
                        color: `text.secondary`,
                        children:
                          (detail.emp.poste || ``) +
                          ` · ` +
                          (detail.emp.departement || ``) +
                          ` · ` +
                          (detail.emp.matricule || ``) +
                          ` · ` +
                          (detail.emp.categorie || ``),
                      }),
                    ],
                  }),
                  (0, $.jsx)(a, {
                    sx: { ml: `auto` },
                    children: sldChipStatut(detail, P),
                  }),
                ],
              })
            : null,
          detail
            ? (0, $.jsxs)(p, {
                children: [
                  sldAlertePerso(detail, P),
                  (0, $.jsxs)(a, {
                    sx: {
                      display: `grid`,
                      gridTemplateColumns: {
                        xs: `repeat(3,1fr)`,
                        sm: `repeat(6,1fr)`,
                      },
                      gap: 1.5,
                    },
                    children: [
                      (0, $.jsx)(SldTuile, {
                        label: `Droit annuel`,
                        valeur: detail.droit + ` j`,
                      }),
                      (0, $.jsx)(SldTuile, {
                        label: `Base`,
                        valeur: detail.base + ` j`,
                      }),
                      (0, $.jsx)(SldTuile, {
                        label: `Report N-1`,
                        valeur: `+` + detail.report + ` j`,
                      }),
                      (0, $.jsx)(SldTuile, {
                        label: `Pris (ouvrables)`,
                        valeur: detail.pris + ` j`,
                      }),
                      (0, $.jsx)(SldTuile, {
                        label: `Disponible`,
                        valeur: detail.dispo + ` j`,
                        couleur:
                          detail.dispo < 0 ? `error.main` : `success.main`,
                      }),
                      (0, $.jsx)(SldTuile, {
                        label: `Projection si accord`,
                        valeur: detail.prev + ` j`,
                        couleur:
                          detail.prev < 0 ? `error.main` : `text.primary`,
                      }),
                      (0, $.jsx)(SldTuile, {
                        label: `Ajustements RH`,
                        valeur: sldSigne(detail.aj || 0) + ` j`,
                        couleur: detail.aj ? `secondary.main` : null,
                      }),
                    ],
                  }),
                  (0, $.jsxs)(a, {
                    sx: { mt: 2 },
                    children: [
                      (0, $.jsx)(i, {
                        variant: `caption`,
                        fontWeight: 700,
                        sx: { color: `text.secondary` },
                        children:
                          `Décompte : jours ouvrables lun-ven, fériés Cameroun déduits · provision indicative ` +
                          sldFCFA(
                            Math.max(detail.dispo, 0) *
                              ((detail.emp.salaire_brut || 0) / 26),
                          ),
                      }),
                      (0, $.jsxs)(a, {
                        sx: {
                          mt: 1.5,
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: `action.hover`,
                        },
                        children: [
                          (0, $.jsx)(i, {
                            variant: `caption`,
                            fontWeight: 800,
                            sx: { display: `block` },
                            children: `Indemnité compensatrice de congés payés (art. 90 CT)`,
                          }),
                          (0, $.jsx)(i, {
                            variant: `h6`,
                            fontWeight: 800,
                            sx: { color: `#7e3ff2` },
                            children: sldFCFA(sldIndemnite(detail, P)),
                          }),
                          (0, $.jsx)(i, {
                            variant: `caption`,
                            color: `text.secondary`,
                            children:
                              Math.max(detail.dispo, 0) +
                              ` j disponibles × ` +
                              sldFCFA(sldCoutJour(detail.emp, P)) +
                              `/j ` +
                              (P.coutFixeOn
                                ? `(coût journalier paramétré)`
                                : `(salaire de référence ÷ 26)`) +
                              ` — due au départ si le congé n'a pas été pris.`,
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, $.jsx)(i, {
                    variant: `subtitle2`,
                    sx: { mt: 2, mb: 1, fontWeight: 800 },
                    children:
                      `Congés annuels ` +
                      (exo === `tous` ? `— tous exercices` : exo) +
                      ` — ` +
                      detail.dems.length +
                      ` demande(s)`,
                  }),
                  detail.dems.length === 0
                    ? (0, $.jsx)(i, {
                        variant: `body2`,
                        color: `text.secondary`,
                        children: `Aucune demande de congé annuel sur cet exercice.`,
                      })
                    : (0, $.jsx)(a, {
                        sx: {
                          display: `flex`,
                          flexDirection: `column`,
                          gap: 1,
                          maxHeight: 260,
                          overflowY: `auto`,
                        },
                        children: detail.dems
                          .slice()
                          .sort((p2, q2) =>
                            p2.date_debut < q2.date_debut ? 1 : -1,
                          )
                          .map((q2) =>
                            (0, $.jsxs)(
                              a,
                              {
                                sx: {
                                  display: `flex`,
                                  alignItems: `center`,
                                  gap: 1.5,
                                  p: 1,
                                  borderRadius: 2,
                                  border: `1px solid`,
                                  borderColor: `divider`,
                                },
                                children: [
                                  (0, $.jsx)(CT, {
                                    sx: { fontSize: 18, color: `primary.main` },
                                  }),
                                  (0, $.jsxs)(a, {
                                    sx: { minWidth: 0, flex: 1 },
                                    children: [
                                      (0, $.jsx)(i, {
                                        variant: `body2`,
                                        fontWeight: 700,
                                        noWrap: !0,
                                        children:
                                          (q2.leave_number || `—`) +
                                          ` · ` +
                                          A(q2.date_debut) +
                                          ` → ` +
                                          A(q2.date_fin),
                                      }),
                                      (0, $.jsx)(i, {
                                        variant: `caption`,
                                        color: `text.secondary`,
                                        children:
                                          sldOuvrables(
                                            q2.date_debut,
                                            q2.date_fin,
                                            sldFset(),
                                          ) +
                                          ` j ouvrables / ` +
                                          q2.nombre_jours +
                                          ` j calendaires` +
                                          (q2.date_demande
                                            ? ` · déposée le ` +
                                              A(q2.date_demande)
                                            : ``),
                                      }),
                                    ],
                                  }),
                                  sldChipDemande(q2.statut),
                                ],
                              },
                              q2.id,
                            ),
                          ),
                      }),
                  (0, $.jsx)(i, {
                    variant: `subtitle2`,
                    sx: { mt: 2, mb: 0.5, fontWeight: 800 },
                    children:
                      `Consommation mensuelle cumulée ` +
                      (exo === `tous` ? AN : exo) +
                      ` (j ouvrables)`,
                  }),
                  sparkData ? sldSpark(sparkData) : null,
                ],
              })
            : null,
          (0, $.jsxs)(m, {
            sx: { px: 3, pb: 2 },
            children: [
              (0, $.jsx)(l, {
                variant: `outlined`,
                color: `warning`,
                onClick: () => fAdjOpen(detail),
                children: `Ajuster le solde`,
              }),
              (0, $.jsx)(l, {
                onClick: () => setDetail(null),
                children: `Fermer`,
              }),
              (0, $.jsx)(l, {
                variant: `contained`,
                startIcon: (0, $.jsx)(CT, {}),
                onClick: () =>
                  nav(`/domaine2_Gestion_Administrative_Personnel/conges`),
                sx: { bgcolor: `#7e3ff2`, textTransform: `none` },
                children: `Ouvrir Congés Annuels`,
              }),
            ],
          }),
        ],
      }),
      (0, $.jsxs)(f, {
        open: !!adj,
        onClose: () => setAdj(null),
        maxWidth: `sm`,
        fullWidth: !0,
        children: [
          adj
            ? (0, $.jsxs)(h, {
                sx: {
                  fontWeight: 800,
                  display: `flex`,
                  alignItems: `center`,
                  gap: 1.5,
                },
                children: [
                  sldAvatar(adj.emp, 40, 17),
                  (0, $.jsxs)(a, {
                    children: [
                      (0, $.jsx)(i, {
                        variant: `h6`,
                        fontWeight: 800,
                        children: `Ajuster le solde`,
                      }),
                      (0, $.jsx)(i, {
                        variant: `caption`,
                        color: `text.secondary`,
                        children:
                          B(adj.emp) +
                          ` · solde actuel ` +
                          adj.dispo +
                          ` j · exercice ` +
                          (exo === `tous` ? AN : exo),
                      }),
                    ],
                  }),
                ],
              })
            : null,
          adj
            ? (0, $.jsxs)(p, {
                children: [
                  (0, $.jsx)(c, {
                    severity: `info`,
                    sx: { mb: 2, fontWeight: 600 },
                    children: `Tout ajustement est horodaté et journalisé (auteur, motif) — consultable dans le Journal d'audit et exportable pour le contrôle interne.`,
                  }),
                  (0, $.jsxs)(o, {
                    spacing: 2,
                    children: [
                      (0, $.jsx)(D, {
                        select: !0,
                        size: `small`,
                        label: `Type d'ajustement`,
                        value: adjF.type,
                        onChange: (e2) =>
                          setAdjF({ ...adjF, type: e2.target.value }),
                        fullWidth: !0,
                        children: Object.keys(SLD3_AJUST_TYPES).map((k2) =>
                          (0, $.jsx)(
                            s,
                            { value: k2, children: SLD3_AJUST_TYPES[k2][0] },
                            k2,
                          ),
                        ),
                      }),
                      adjF.type !== `recuperation` && adjF.type !== `sans_solde`
                        ? (0, $.jsxs)(D, {
                            select: !0,
                            size: `small`,
                            label: `Sens de l'ajustement`,
                            value: String(adjF.sens),
                            onChange: (e2) =>
                              setAdjF({
                                ...adjF,
                                sens: Number(e2.target.value),
                              }),
                            fullWidth: !0,
                            children: [
                              (0, $.jsx)(s, {
                                value: `1`,
                                children: `Ajouter des jours (+)`,
                              }),
                              (0, $.jsx)(s, {
                                value: `-1`,
                                children: `Retirer des jours (−)`,
                              }),
                            ],
                          })
                        : null,
                      (0, $.jsx)(D, {
                        type: `number`,
                        size: `small`,
                        label: `Nombre de jours`,
                        value: adjF.jours,
                        onChange: (e2) =>
                          setAdjF({ ...adjF, jours: e2.target.value }),
                        fullWidth: !0,
                        inputProps: { min: 0.5, max: 60, step: 0.5 },
                        helperText: `Demi-journées acceptées (0,5) — entre 0,5 et 60 j`,
                      }),
                      (0, $.jsx)(D, {
                        multiline: !0,
                        rows: 2,
                        size: `small`,
                        label: `Motif (obligatoire)`,
                        value: adjF.motif,
                        onChange: (e2) =>
                          setAdjF({ ...adjF, motif: e2.target.value }),
                        fullWidth: !0,
                        helperText: `Ex. : repos compensateur 01/05, régularisation paie mars…`,
                      }),
                      (0, $.jsx)(a, {
                        sx: {
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: `action.hover`,
                          textAlign: `center`,
                        },
                        children: (0, $.jsx)(i, {
                          variant: `body2`,
                          fontWeight: 800,
                          children:
                            `Nouveau solde disponible : ` +
                            (adj.dispo +
                              (adjF.type === `recuperation`
                                ? 1
                                : adjF.type === `sans_solde`
                                  ? -1
                                  : Number(adjF.sens) || 1) *
                                (Math.abs(Number(adjF.jours)) || 0)) +
                            ` j`,
                        }),
                      }),
                    ],
                  }),
                ],
              })
            : null,
          (0, $.jsxs)(m, {
            sx: { px: 3, pb: 2 },
            children: [
              (0, $.jsx)(l, {
                onClick: () => setAdj(null),
                children: `Annuler`,
              }),
              (0, $.jsx)(l, {
                variant: `contained`,
                onClick: fAjustSubmit,
                sx: { bgcolor: `#7e3ff2`, textTransform: `none` },
                children: `Enregistrer l'ajustement`,
              }),
            ],
          }),
        ],
      }),
      (0, $.jsxs)(f, {
        open: !!jrn,
        onClose: () => setJrn(0),
        maxWidth: `md`,
        fullWidth: !0,
        children: [
          (0, $.jsx)(h, {
            sx: { fontWeight: 800 },
            children:
              `Journal d'audit des ajustements — ` +
              journal.length +
              ` mouvement(s)`,
          }),
          (0, $.jsxs)(p, {
            children: [
              journal.length === 0
                ? (0, $.jsx)(c, {
                    severity: `success`,
                    sx: { fontWeight: 600 },
                    children: `Aucun ajustement manuel enregistré. Tous les soldes proviennent exclusivement du calcul automatique (droits, reports, demandes Congés V2).`,
                  })
                : (0, $.jsx)(a, {
                    sx: {
                      display: `flex`,
                      flexDirection: `column`,
                      gap: 1,
                      maxHeight: 420,
                      overflowY: `auto`,
                    },
                    children: journal.map((x2) =>
                      (0, $.jsxs)(
                        a,
                        {
                          sx: {
                            display: `flex`,
                            gap: 1.5,
                            alignItems: `flex-start`,
                            p: 1,
                            borderRadius: 2,
                            border: `1px solid`,
                            borderColor: `divider`,
                          },
                          children: [
                            (0, $.jsx)(HIS, {
                              sx: {
                                fontSize: 18,
                                color: `text.secondary`,
                                mt: 0.25,
                              },
                            }),
                            (0, $.jsxs)(a, {
                              sx: { flex: 1, minWidth: 0 },
                              children: [
                                (0, $.jsx)(i, {
                                  variant: `body2`,
                                  fontWeight: 700,
                                  children:
                                    x2.emp_nom + ` · exercice ` + x2.annee,
                                }),
                                (0, $.jsx)(i, {
                                  variant: `caption`,
                                  color: `text.secondary`,
                                  sx: { display: `block` },
                                  children:
                                    new Date(x2.ts).toLocaleString() +
                                    ` · auteur : ` +
                                    x2.auteur,
                                }),
                                (0, $.jsx)(i, {
                                  variant: `caption`,
                                  sx: { display: `block`, mt: 0.5 },
                                  children:
                                    (SLD3_AJUST_TYPES[x2.type] || [
                                      x2.type,
                                    ])[0] +
                                    ` — motif : ` +
                                    x2.motif,
                                }),
                              ],
                            }),
                            (0, $.jsx)(T, {
                              label: sldSigne(x2.jours) + ` j`,
                              size: `small`,
                              color: x2.jours > 0 ? `success` : `warning`,
                              variant: `filled`,
                              sx: { fontWeight: 800, fontSize: `0.72rem` },
                            }),
                          ],
                        },
                        x2.id,
                      ),
                    ),
                  }),
            ],
          }),
          (0, $.jsxs)(m, {
            sx: { px: 3, pb: 2 },
            children: [
              (0, $.jsx)(l, { onClick: () => setJrn(0), children: `Fermer` }),
              (0, $.jsx)(l, {
                variant: `contained`,
                startIcon: (0, $.jsx)(S, {}),
                onClick: fJrnExport,
                disabled: journal.length === 0,
                sx: { bgcolor: `#7e3ff2`, textTransform: `none` },
                children: `Exporter le journal (CSV)`,
              }),
            ],
          }),
        ],
      }),
      (0, $.jsxs)(f, {
        open: !!par,
        onClose: () => {
          (setPar(0), setP(sld3Params()));
        },
        maxWidth: `sm`,
        fullWidth: !0,
        children: [
          (0, $.jsx)(h, {
            sx: { fontWeight: 800 },
            children: `Paramètres du cockpit`,
          }),
          (0, $.jsxs)(p, {
            children: [
              (0, $.jsx)(c, {
                severity: `info`,
                sx: { mb: 2, fontWeight: 600 },
                children: `Ces réglages pilotent les seuils de statut, les droits de base et la valorisation financière (provisions, indemnité compensatrice). Ils sont persistés sur ce poste et appliqués immédiatement après enregistrement.`,
              }),
              (0, $.jsxs)(o, {
                spacing: 2,
                children: [
                  (0, $.jsxs)(o, {
                    direction: `row`,
                    spacing: 2,
                    children: [
                      (0, $.jsx)(D, {
                        type: `number`,
                        size: `small`,
                        label: `Base Cadre (j/an)`,
                        value: P.baseCadre,
                        onChange: (e2) =>
                          setP({ ...P, baseCadre: e2.target.value }),
                        fullWidth: !0,
                        inputProps: { min: 0, max: 60 },
                      }),
                      (0, $.jsx)(D, {
                        type: `number`,
                        size: `small`,
                        label: `Base non-Cadre (j/an)`,
                        value: P.baseAutre,
                        onChange: (e2) =>
                          setP({ ...P, baseAutre: e2.target.value }),
                        fullWidth: !0,
                        inputProps: { min: 0, max: 60 },
                      }),
                    ],
                  }),
                  (0, $.jsxs)(o, {
                    direction: `row`,
                    spacing: 2,
                    children: [
                      (0, $.jsx)(D, {
                        type: `number`,
                        size: `small`,
                        label: `Seuil sous-utilisé (%)`,
                        value: P.seuilSous,
                        onChange: (e2) =>
                          setP({ ...P, seuilSous: e2.target.value }),
                        fullWidth: !0,
                        inputProps: { min: 0, max: 100 },
                      }),
                      (0, $.jsx)(D, {
                        type: `number`,
                        size: `small`,
                        label: `Seuil tendu (%)`,
                        value: P.seuilTendu,
                        onChange: (e2) =>
                          setP({ ...P, seuilTendu: e2.target.value }),
                        fullWidth: !0,
                        inputProps: { min: 0, max: 100 },
                      }),
                    ],
                  }),
                  (0, $.jsxs)(D, {
                    select: !0,
                    size: `small`,
                    label: `Valorisation financière`,
                    value: P.coutFixeOn ? `1` : `0`,
                    onChange: (e2) =>
                      setP({
                        ...P,
                        coutFixeOn: e2.target.value === `1` ? 1 : 0,
                      }),
                    children: [
                      (0, $.jsx)(s, {
                        value: `0`,
                        children: `Salaire réel de chaque employé ÷ 26`,
                      }),
                      (0, $.jsx)(s, {
                        value: `1`,
                        children: `Coût journalier fixe global`,
                      }),
                    ],
                  }),
                  P.coutFixeOn
                    ? (0, $.jsx)(D, {
                        type: `number`,
                        size: `small`,
                        label: `Coût journalier fixe (FCFA)`,
                        value: P.coutFixe,
                        onChange: (e2) =>
                          setP({ ...P, coutFixe: e2.target.value }),
                        fullWidth: !0,
                        inputProps: { min: 0, step: 500 },
                      })
                    : null,
                ],
              }),
            ],
          }),
          (0, $.jsxs)(m, {
            sx: { px: 3, pb: 2 },
            children: [
              (0, $.jsx)(l, {
                onClick: () => {
                  (setPar(0), setP(sld3Params()));
                },
                children: `Annuler`,
              }),
              (0, $.jsx)(l, {
                variant: `contained`,
                startIcon: (0, $.jsx)(TUNE, {}),
                onClick: fParSave,
                sx: { bgcolor: `#7e3ff2`, textTransform: `none` },
                children: `Enregistrer`,
              }),
            ],
          }),
        ],
      }),
      (0, $.jsxs)(f, {
        open: !!simu,
        onClose: () => setSimu(0),
        maxWidth: `lg`,
        fullWidth: !0,
        children: [
          (0, $.jsx)(h, {
            sx: { fontWeight: 800 },
            children:
              `Simulateur de clôture d'exercice ` + AN + ` → ` + (AN + 1),
          }),
          (0, $.jsxs)(p, {
            children: [
              (0, $.jsx)(c, {
                severity: `info`,
                sx: { mb: 2, fontWeight: 600 },
                children:
                  `Art. 89 du Code du travail : les congés doivent être pris dans les 12 mois qui suivent l'ouverture du droit. Choisissez une politique de report pour préparer la bascule du 01/01/` +
                  (AN + 1) +
                  ` — la simulation est sans effet sur les données jusqu'à décision en comité RH.`,
              }),
              (0, $.jsxs)(a, {
                sx: {
                  display: `flex`,
                  gap: 2,
                  flexWrap: `wrap`,
                  mb: 2,
                  alignItems: `center`,
                },
                children: [
                  (0, $.jsxs)(D, {
                    select: !0,
                    size: `small`,
                    label: `Politique de report`,
                    value: pol.politique,
                    onChange: (e2) =>
                      setPol({ ...pol, politique: e2.target.value }),
                    sx: { minWidth: 320, maxWidth: `100%` },
                    children: [
                      (0, $.jsx)(s, {
                        value: `integrale`,
                        children: `Reporter intégralement les soldes non consommés`,
                      }),
                      (0, $.jsx)(s, {
                        value: `plafond`,
                        children: `Reporter avec plafond (limite paramétrable)`,
                      }),
                      (0, $.jsx)(s, {
                        value: `purge`,
                        children: `Purger les droits non consommés (application stricte art. 89)`,
                      }),
                    ],
                  }),
                  pol.politique === `plafond`
                    ? (0, $.jsx)(D, {
                        type: `number`,
                        size: `small`,
                        label: `Plafond (jours)`,
                        value: pol.plafond,
                        onChange: (e2) =>
                          setPol({ ...pol, plafond: e2.target.value }),
                        sx: { width: 170 },
                        inputProps: { min: 0, max: 30 },
                      })
                    : null,
                  simRows
                    ? (0, $.jsx)(i, {
                        variant: `caption`,
                        sx: { color: `text.secondary` },
                        children:
                          `Total report simulé : ` +
                          simRows.reduce((s3, r2) => s3 + r2.rep, 0) +
                          ` j · ouverture cumulée ` +
                          simRows.reduce((s3, r2) => s3 + r2.ouvert, 0) +
                          ` j`,
                      })
                    : null,
                ],
              }),
              simRows
                ? (0, $.jsx)(y, {
                    sx: { overflowX: `auto`, maxHeight: 380 },
                    children: (0, $.jsxs)(ne, {
                      size: `small`,
                      stickyHeader: !0,
                      children: [
                        (0, $.jsx)(te, {
                          children: (0, $.jsxs)(b, {
                            children: [
                              (0, $.jsx)(v, { children: `Employé` }),
                              (0, $.jsx)(v, {
                                align: `right`,
                                children: `Solde fin ` + AN,
                              }),
                              (0, $.jsx)(v, {
                                align: `right`,
                                children: `Report simulé → ` + (AN + 1),
                              }),
                              (0, $.jsx)(v, {
                                align: `right`,
                                children: `Droit ` + (AN + 1),
                              }),
                              (0, $.jsx)(v, {
                                align: `right`,
                                children: `Solde d'ouverture ` + (AN + 1),
                              }),
                            ],
                          }),
                        }),
                        (0, $.jsx)(_, {
                          children: simRows.map((r2, i3) =>
                            (0, $.jsxs)(
                              b,
                              {
                                hover: !0,
                                children: [
                                  (0, $.jsx)(v, {
                                    children: (0, $.jsxs)(a, {
                                      sx: {
                                        display: `flex`,
                                        alignItems: `center`,
                                        gap: 1,
                                      },
                                      children: [
                                        sldAvatar(r2.emp, 30, 11),
                                        (0, $.jsx)(i, {
                                          variant: `body2`,
                                          fontWeight: 700,
                                          noWrap: !0,
                                          children: B(r2.emp),
                                        }),
                                      ],
                                    }),
                                  }),
                                  (0, $.jsx)(v, {
                                    align: `right`,
                                    children: r2.fin + ` j`,
                                  }),
                                  (0, $.jsx)(v, {
                                    align: `right`,
                                    children: (0, $.jsx)(i, {
                                      variant: `body2`,
                                      fontWeight: 700,
                                      sx: {
                                        color:
                                          r2.rep > 0
                                            ? `secondary.main`
                                            : `text.disabled`,
                                      },
                                      children: `+` + r2.rep + ` j`,
                                    }),
                                  }),
                                  (0, $.jsx)(v, {
                                    align: `right`,
                                    children:
                                      r2.droit +
                                      ` j` +
                                      (r2.prorata ? ` (prorata)` : ``),
                                  }),
                                  (0, $.jsx)(v, {
                                    align: `right`,
                                    children: (0, $.jsx)(i, {
                                      variant: `body2`,
                                      fontWeight: 800,
                                      children: r2.ouvert + ` j`,
                                    }),
                                  }),
                                ],
                              },
                              r2.emp.id || i3,
                            ),
                          ),
                        }),
                      ],
                    }),
                  })
                : null,
              (0, $.jsx)(i, {
                variant: `caption`,
                sx: { color: `text.secondary`, display: `block`, mt: 1.5 },
                children:
                  `Droit ` +
                  (AN + 1) +
                  ` calculé avec prorata d'embauche éventuel. Les soldes négatifs ne sont pas reportés (débit à régulariser par ajustement).`,
              }),
            ],
          }),
          (0, $.jsxs)(m, {
            sx: { px: 3, pb: 2 },
            children: [
              (0, $.jsx)(l, { onClick: () => setSimu(0), children: `Fermer` }),
              (0, $.jsx)(l, {
                variant: `contained`,
                startIcon: (0, $.jsx)(S, {}),
                onClick: fSimExport,
                sx: { bgcolor: `#7e3ff2`, textTransform: `none` },
                children: `Exporter la simulation (CSV)`,
              }),
            ],
          }),
        ],
      }),
      (0, $.jsx)(d, {
        open: !!snack,
        autoHideDuration: 4e3,
        onClose: () => setSnack(null),
        anchorOrigin: { vertical: `bottom`, horizontal: `center` },
        message: snack ? snack.msg : ``,
      }),
    ],
  });
}

/* ================================================================
   HEURES SUPP V2 — Cockpit validation & intégration paie (écran 'heures-supp')
   Pattern AbsencesV2 : hydratation autonome (localStorage admina_d2_heures_v2
   ?? seed ?? historique simulé déterministe), conformité Code du travail
   Cameroun : 40 h/semaine (art. 90 CT), majorations minimales décret n° 93/184
   (jour +20 à +40 % selon la tranche hebdomadaire (décret n° 93/184), nuit +50 %, dimanche & férié non chômé +40 %), plafond 20 h/semaine,
   workflow manager (validation OBLIGATOIRE avant paie) · lot paie mensuel.
   Aucun autre écran du chunk n'utilise ce code (branchement dédié dans ie).
   ================================================================ */
var HS_LS = `admina_d2_heures_v2`;
var HS_ST = {
  en_attente: [`En attente`, `warning`, `outlined`],
  validee: [`Validée`, `success`, `outlined`],
  rejetee: [`Rejetée`, `default`, `outlined`],
  payee: [`Payée`, `info`, `outlined`],
};
var HS_TRANCHES = {
  jour: [`Jour ouvrable (06 h – 22 h)`, 20],
  nuit: [`Nuit ouvrable (22 h – 06 h)`, 50],
  dim_j: [`Dimanche — jour`, 40],
  dim_n: [`Dimanche — nuit`, 50],
  fer_j: [`Jour férié — jour`, 40],
  fer_n: [`Jour férié — nuit`, 50],
  feries: [`Dimanche & férié (ancien)`, 60],
};
/* ================================================================
   CONFIGURATEUR DE TAUX (Task 14-c) — presets pays, calcul par
   catégories combinables (jour/nuit × dimanche × férié) ou tranches
   progressives hebdomadaires, simulateur pas-à-pas, application au
   tableau. Taux MINIMAUX légaux — tous les champs restent éditables
   (convention collective plus favorable). Store : meta étendue
   (pays, modeCalc, brackets, mjDimJ/D/N, mjFerJ/N) — rétrocompatible v1.
   ================================================================ */
var HS_CATS6 = [`jour`, `nuit`, `dim_j`, `dim_n`, `fer_j`, `fer_n`];
var HS_PAYS = {
  CM: {
    nom: `Cameroun`,
    ref: `Décret n° 93/184 du 27/04/1993 + Code du travail (art. 89-91) — jour ouvrable en tranches hebdomadaires (41e–48e +20 %, 49e–56e +30 %, 57e–60e +40 %), nuit (22 h–06 h) +50 %, dimanches & jours fériés non chômés +40 % (nuit +50 %)`,
    modeCalc: `prog`,
    brackets: [
      [8, 20],
      [8, 30],
      [4, 40],
    ],
    mj: {
      jour: 20,
      nuit: 50,
      dim_j: 40,
      dim_n: 50,
      fer_j: 40,
      fer_n: 50,
      feries: 40,
    },
    quotaHebdo: 20,
    quotaAn: 240,
  },
  FR: {
    nom: `France`,
    ref: `Code du travail art. L3121-36 — 8 premières heures +25 %, suivantes +50 % ; contingent annuel 220 h (L3121-22) ; durée légale 35 h`,
    modeCalc: `prog`,
    brackets: [
      [8, 25],
      [12, 50],
    ],
    mj: {
      jour: 25,
      nuit: 25,
      dim_j: 50,
      dim_n: 100,
      fer_j: 50,
      fer_n: 100,
      feries: 50,
    },
    quotaHebdo: 13,
    quotaAn: 220,
  },
  CI: {
    nom: `Côte d'Ivoire`,
    ref: `Loi n° 2015-532 du 20/07/2015 — jour ouvrable +15 %, nuit +75 %, dimanches & jours fériés de jour +75 %, de nuit +100 %`,
    modeCalc: `simple`,
    brackets: [
      [8, 15],
      [12, 40],
    ],
    mj: {
      jour: 15,
      nuit: 75,
      dim_j: 75,
      dim_n: 100,
      fer_j: 75,
      fer_n: 100,
      feries: 75,
    },
    quotaHebdo: 20,
    quotaAn: 240,
  },
  SN: {
    nom: `Sénégal`,
    ref: `Code du travail (loi n° 97-17) + décret d'application — 8 premières heures +15 %, suivantes +40 %, dimanches & jours fériés +60 %`,
    modeCalc: `prog`,
    brackets: [
      [8, 15],
      [12, 40],
    ],
    mj: {
      jour: 15,
      nuit: 50,
      dim_j: 60,
      dim_n: 100,
      fer_j: 60,
      fer_n: 100,
      feries: 60,
    },
    quotaHebdo: 20,
    quotaAn: 240,
  },
  MA: {
    nom: `Maroc`,
    ref: `Code du travail (loi n° 65-99) art. 196 & 201 — jour (06 h–21 h) +25 %, nuit (21 h–06 h) +50 %, jour de repos hebdomadaire +50 % (nuit +100 %)`,
    modeCalc: `simple`,
    brackets: [
      [8, 25],
      [12, 50],
    ],
    mj: {
      jour: 25,
      nuit: 50,
      dim_j: 50,
      dim_n: 100,
      fer_j: 50,
      fer_n: 100,
      feries: 50,
    },
    quotaHebdo: 20,
    quotaAn: 240,
  },
  XX: {
    nom: `Personnalisé`,
    ref: `Taux libres — configurez vos propres majorations selon votre convention collective ou votre politique salariale`,
    modeCalc: `simple`,
    brackets: [
      [8, 20],
      [8, 30],
      [4, 40],
    ],
    mj: {
      jour: 20,
      nuit: 50,
      dim_j: 40,
      dim_n: 50,
      fer_j: 40,
      fer_n: 50,
      feries: 60,
    },
    quotaHebdo: 20,
    quotaAn: 240,
  },
};
function hsMjCat(tr, mt) {
  var c = tr || `jour`;
  if (c === `nuit`) return mt.mjNuit;
  if (c === `feries`) return mt.mjFerie;
  if (c === `dim_j`) return mt.mjDimJ;
  if (c === `dim_n`) return mt.mjDimN;
  if (c === `fer_j`) return mt.mjFerJ;
  if (c === `fer_n`) return mt.mjFerN;
  return mt.mjJour;
}
function hsBrkDeb(mt) {
  var s = 0,
    out = [];
  (mt.brackets || []).forEach(function (b) {
    out.push([s, s + b[0], b[1]]);
    s += b[0];
  });
  return out;
}
function hsBrkLbl(mt) {
  return hsBrkDeb(mt)
    .map(function (b) {
      return b[0] + 1 + `e–` + b[1] + `e : +` + b[2] + ` %`;
    })
    .join(` · `);
}
/* Calcul d'une ligne HS selon la configuration active.
   pos = heures HS déjà cumulées la même semaine par le salarié —
   les tranches progressives du jour ouvrable se consomment dans
   l'ordre (décret CM : 41e à la 60e heure de la semaine).
   Retour : { montant, det:[[h, mj]...], prog } */
function hsCalcRow(h, th, tr, mt, pos) {
  h = h || 0;
  pos = pos || 0;
  if (mt.modeCalc === `prog` && (tr || `jour`) === `jour`) {
    var brs = hsBrkDeb(mt),
      dern = brs[brs.length - 1];
    var det = [],
      tot = 0,
      i,
      a,
      b;
    for (i = 0; i < brs.length; i++) {
      a = Math.max(pos, brs[i][0]);
      b = Math.min(pos + h, brs[i][1]);
      if (b > a) {
        det.push([b - a, brs[i][2]]);
        tot += (b - a) * th * (1 + brs[i][2] / 100);
      }
    }
    if (pos + h > dern[1]) {
      a = Math.max(pos, dern[1]);
      b = pos + h;
      if (b > a) {
        det.push([b - a, dern[2]]);
        tot += (b - a) * th * (1 + dern[2] / 100);
      }
    }
    return { montant: Math.round(tot), det: det, prog: !0 };
  }
  var mj = hsMjCat(tr, mt);
  return {
    montant: Math.round(h * th * (1 + mj / 100)),
    det: [[h, mj]],
    prog: !1,
  };
}
function hsPosSem(emp, sem) {
  var p = 0;
  hsToutes().forEach(function (r2) {
    if (r2.statut !== `rejetee` && r2.employee_id === emp && r2.semaine === sem)
      p += r2.heures_supp || 0;
  });
  return p;
}
/* Applique la configuration de taux à TOUTES les lignes (taux +
   montants recalculés) — c'est l'application visible au tableau.
   Position hebdo = ordre d'itération de hsToutes (identique au
   mémo ALL) ; les lignes rejetées sont recalculées sans consommer
   de tranche. */
function hsApplTout(m2) {
  var st = hsStore();
  st.patches = st.patches || {};
  var all = hsToutes();
  var wk = {};
  all.forEach(function (r) {
    if (!hsSemInfo(r.semaine)) return;
    var k = r.employee_id + `|` + r.semaine;
    (wk[k] = wk[k] || []).push(r);
  });
  var n = 0;
  Object.keys(wk).forEach(function (k) {
    var pos = 0;
    wk[k].forEach(function (r) {
      var th = hsTauxHoraire(R(r.employee_id), m2);
      var h = r.heures_supp || 0;
      var c = hsCalcRow(h, th, r.tranche, m2, pos);
      st.patches[r.id] = Object.assign({}, st.patches[r.id], {
        taux_majoration: c.prog
          ? `progressif`
          : 100 + hsMjCat(r.tranche, m2) + `%`,
        montant_brut: Math.round(h * th),
        montant_calcule: c.montant,
      });
      if (r.statut !== `rejetee`) pos += h;
      n++;
    });
  });
  hsSave(st);
  return n;
}

var HS_VALID = `emp-009`;
function hsStore() {
  try {
    var r = localStorage.getItem(HS_LS);
    if (r) {
      var s = JSON.parse(r);
      if (s && s.v === 1) return s;
    }
  } catch (err) {}
  return {
    v: 1,
    records: [],
    patches: {},
    meta: {
      quotaHebdo: 20,
      quotaAn: 240,
      mjJour: 20,
      mjNuit: 50,
      mjFerie: 40,
      mjDimJ: 40,
      mjDimN: 50,
      mjFerJ: 40,
      mjFerN: 50,
      seuilS4: 30,
      tauxDefaut: 1500,
      pays: `CM`,
      modeCalc: `simple`,
      brackets: [
        [8, 20],
        [8, 30],
        [4, 40],
      ],
    },
  };
}
function hsSave(st) {
  try {
    localStorage.setItem(HS_LS, JSON.stringify(st));
  } catch (err) {}
}
function hsMeta(st) {
  var m = (st && st.meta) || {};
  function nz(v, d) {
    return v === 0 ? 0 : v || d;
  }
  return {
    quotaHebdo: nz(m.quotaHebdo, 20),
    quotaAn: nz(m.quotaAn, 240),
    mjJour: nz(m.mjJour, 20),
    mjNuit: nz(m.mjNuit, 50),
    mjFerie: nz(m.mjFerie, 40),
    mjDimJ: nz(m.mjDimJ, 40),
    mjDimN: nz(m.mjDimN, 50),
    mjFerJ: nz(m.mjFerJ, 40),
    mjFerN: nz(m.mjFerN, 50),
    seuilS4: m.seuilS4 || 30,
    tauxDefaut: m.tauxDefaut || 1500,
    pays: m.pays || `CM`,
    modeCalc: m.modeCalc === `prog` ? `prog` : `simple`,
    brackets:
      m.brackets && m.brackets.length
        ? m.brackets.map(function (b) {
            return [b[0] || 8, b[1] === 0 ? 0 : b[1] || 20];
          })
        : [
            [8, 20],
            [8, 30],
            [4, 40],
          ],
  };
}
function hsSeed() {
  return re && re[`heures-supp`] && Array.isArray(re[`heures-supp`].data)
    ? re[`heures-supp`].data
    : [];
}
function hsSemInfo(s2) {
  var m = /^S(\d+)-(\d{4})$/.exec(String(s2 || ``));
  return m ? { num: parseInt(m[1], 10), an: parseInt(m[2], 10) } : null;
}
function hsIdx(si) {
  return si ? si.an * 53 + si.num : 0;
}
function hsSemLundi(num, an) {
  var d = new Date(Date.UTC(an, 0, 4));
  var dow = d.getUTCDay() || 7;
  d = new Date(d.getTime() - (dow - 1) * 864e5);
  return new Date(d.getTime() + (num - 1) * 7 * 864e5);
}
function hsSemMois(num, an) {
  /* Rattachement ISO : la semaine appartient au mois de son jeudi (norme ISO 8601) */
  return new Date(hsSemLundi(num, an).getTime() + 3 * 864e5).getUTCMonth() + 1;
}
function hsSemCourante() {
  var d = new Date();
  var an = d.getFullYear();
  var t = new Date(Date.UTC(an, 0, 4));
  var dow = t.getUTCDay() || 7;
  t = new Date(t.getTime() - (dow - 1) * 864e5);
  var n = Math.floor((d.getTime() - t.getTime()) / (7 * 864e5)) + 1;
  return { num: n, an: an, key: `S` + n + `-` + an };
}
function hsMjTranche(tr, mt) {
  return hsMjCat(tr, mt);
}
function hsTauxNum(r) {
  var n = parseFloat(String(r.taux_majoration || ``).replace(`%`, ``));
  return isNaN(n) ? 100 : n;
}
function hsTauxHoraire(emp, mt) {
  return emp && emp.salaire_brut
    ? Math.round((emp.salaire_brut / 173.33) * 100) / 100
    : mt.tauxDefaut;
}
function hsAttendu(r, mt, pos) {
  var th = hsTauxHoraire(r.emp, mt);
  return hsCalcRow(r.heures_supp || 0, th, r.tranche, mt, pos).montant;
}
var HS_SIM_CACHE = null;
function hsToutes() {
  var st = hsStore();
  var all = hsSeed()
    .map((r) => Object.assign({ source: `base` }, r))
    .concat(
      (function () {
        if (!HS_SIM_CACHE) HS_SIM_CACHE = hsSimu();
        return HS_SIM_CACHE.map((r) => Object.assign({ source: `sim` }, r));
      })(),
    );
  var ids = {};
  all.forEach((r) => (ids[r.id] = 1));
  (st.records || []).forEach((r) => {
    if (!ids[r.id]) all.push(Object.assign({ source: `v2` }, r));
  });
  all.forEach((r) => {
    if (st.patches && st.patches[r.id]) Object.assign(r, st.patches[r.id]);
  });
  return all;
}
function hsPct(pris, quota) {
  return quota > 0 ? Math.min(100, Math.round((pris / quota) * 100)) : 0;
}
function hsPlaf(cumul, quota) {
  var pct = hsPct(cumul, quota);
  return {
    pris: cumul,
    quota: quota,
    pct: pct,
    etat: pct >= 100 ? `fin` : pct >= 80 ? `proche` : `ok`,
  };
}
function hsMoisSerie(rows, an) {
  var out = [];
  for (var m2 = 1; m2 <= 12; m2++) {
    var s = 0;
    (rows || []).forEach((rd) => {
      if (rd.statut === `rejetee`) return;
      var si = hsSemInfo(rd.semaine);
      if (!si || si.an !== parseInt(an, 10)) return;
      if (hsSemMois(si.num, si.an) === m2) s += rd.heures_supp || 0;
    });
    out.push(s);
  }
  return out;
}
function hsDeltaAn(rows, an) {
  function tot(a) {
    var s = 0;
    (rows || []).forEach((rd) => {
      if (rd.statut === `rejetee`) return;
      var si = hsSemInfo(rd.semaine);
      if (si && si.an === parseInt(a, 10)) s += rd.heures_supp || 0;
    });
    return s;
  }
  var n = tot(an),
    n1 = tot(parseInt(an, 10) - 1);
  return { n: n, n1: n1, d: n - n1 };
}
function hsAnAuto(rows) {
  var m = {};
  var cur = String(new Date().getFullYear());
  var best = cur,
    nb = 0;
  (rows || []).forEach((rd) => {
    var si = hsSemInfo(rd.semaine);
    if (!si) return;
    var k = String(si.an);
    m[k] = (m[k] || 0) + 1;
    if (m[k] > nb) ((nb = m[k]), (best = k));
  });
  if (m[cur]) best = cur;
  return best;
}
function hsMoisLabel(n) {
  return (
    [
      `Jan`,
      `Fév`,
      `Mar`,
      `Avr`,
      `Mai`,
      `Juin`,
      `Juil`,
      `Août`,
      `Sep`,
      `Oct`,
      `Nov`,
      `Déc`,
    ][n - 1] || `?`
  );
}
function hsSimu() {
  if (HS_SIM_CACHE) return HS_SIM_CACHE;
  function mb(a) {
    return function () {
      ((a |= 0), (a = (a + 1831565813) | 0));
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  var rng = mb(42179);
  var emps = [
    `emp-003`,
    `emp-005`,
    `emp-009`,
    `emp-014`,
    `emp-017`,
    `emp-001`,
    `emp-008`,
  ];
  var cur = hsSemCourante();
  var curIdx = cur.an * 53 + cur.num;
  var out = [];
  for (var an = 2025; an <= cur.an; an++) {
    var maxN = an === cur.an ? cur.num - 1 : 52;
    for (var n2 = 1; n2 <= maxN; n2++) {
      var si = { num: n2, an: an };
      var idx = an * 53 + n2;
      var lundi = hsSemLundi(n2, an);
      var dDecl = lundi.toISOString().slice(0, 10);
      emps.forEach((eid) => {
        var hot = (eid === `emp-014` || eid === `emp-005`) && idx >= curIdx - 4;
        var recent = idx >= curIdx - 4;
        var p = hot ? 0.85 : recent ? 0.5 : 0.34;
        if (rng() > p) return;
        var h = hot
          ? 8 + Math.floor(rng() * 5)
          : 2 + Math.floor(rng() * (recent ? 9 : 11));
        var rr = rng();
        var tr = rr < 0.82 ? `jour` : rr < 0.94 ? `nuit` : `feries`;
        var mj = tr === `nuit` ? 50 : tr === `feries` ? 60 : 20;
        var taux = rng() < 0.86 ? 100 + mj : rng() < 0.5 ? 100 : 125;
        var statut =
          idx >= curIdx - 1
            ? `en_attente`
            : an === 2025
              ? `payee`
              : rng() < 0.9
                ? `validee`
                : `rejetee`;
        var th = hsTauxHoraire(R(eid), hsMeta(hsStore()));
        var montant = Math.round(h * th * (taux / 100));
        var vn = out.filter((x2) => x2.employee_id === eid).length + 1;
        out.push({
          id: `hs-sim-` + an + `-` + n2 + `-` + eid + `-` + vn,
          employee_id: eid,
          semaine: `S` + n2 + `-` + an,
          heures_normales: 40,
          heures_supp: h,
          tranche: tr,
          taux_majoration: taux + `%`,
          montant_brut: Math.round(h * th),
          montant_calcule: montant,
          statut: statut,
          valide_par:
            statut === `en_attente` || statut === `rejetee` ? null : HS_VALID,
          valide_le:
            statut === `en_attente` || statut === `rejetee`
              ? null
              : new Date(lundi.getTime() + 2 * 864e5)
                  .toISOString()
                  .slice(0, 10),
          date_decl: dDecl,
          motif:
            tr === `nuit`
              ? `Exploitation nocturne`
              : tr === `feries`
                ? `Urgence jour férié`
                : `Charge exceptionnelle`,
        });
        if (hot && rng() < 0.3) {
          var h2 = 8 + Math.floor(rng() * 6);
          var tr2 = `feries`;
          var tx2 = 160;
          var vn2 = out.filter((x2) => x2.employee_id === eid).length + 1;
          out.push({
            id: `hs-sim-` + an + `-` + n2 + `-` + eid + `-b-` + vn2,
            employee_id: eid,
            semaine: `S` + n2 + `-` + an,
            heures_normales: 0,
            heures_supp: h2,
            tranche: tr2,
            taux_majoration: tx2 + `%`,
            montant_brut: Math.round(h2 * th),
            montant_calcule: Math.round(h2 * th * (tx2 / 100)),
            statut: `validee`,
            valide_par: HS_VALID,
            valide_le: new Date(lundi.getTime() + 3 * 864e5)
              .toISOString()
              .slice(0, 10),
            date_decl: dDecl,
            motif: `Rattrapage dimanche & férié`,
          });
        }
      });
    }
  }
  HS_SIM_CACHE = out;
  return out;
}

/* ================================================================
   POINTAGE V2 — Journal de présence intelligent (écran 'pointage')
   Pattern HeuresSuppV2/AbsencesV2 : hydratation autonome (localStorage
   admina_d2_pointage_v2 ?? seed démo ?? historique simulé déterministe),
   Code du travail Cameroun : 40 h/semaine (art. 90 CT), jours ouvrables
   lun–ven, fériés officiels (sldFset), workflow manager : saisie
   quotidienne → validation hebdo OBLIGATOIRE avant export planning +
   paie (sous-titre d'origine enfin honoré). Grille visuelle employés ×
   jours (P/R/A/M/T/F) éditable 1 clic, alertes (taux < seuil, retards
   répétés, brouillons en retard), pilotage 12 semaines, export CSV
   prêt paie. Aucun autre écran du chunk n'utilise ce code (branchement
   dédié dans ie).
   ================================================================ */
var PT_LS = `admina_d2_pointage_v2`;
var PT_VALID = `emp-009`;
var PT_ST = {
  valide: [`Valide`, `success`, `outlined`],
  brouillon: [`Brouillon`, `warning`, `outlined`],
  rejete: [`Rejeté`, `error`, `outlined`],
};
var PT_JC = {
  P: { lbl: `Présent`, c: `success.main`, bg: `rgba(46,125,50,.12)` },
  R: { lbl: `Retard`, c: `warning.main`, bg: `rgba(237,108,2,.14)` },
  A: { lbl: `Absent`, c: `error.main`, bg: `rgba(211,47,47,.12)` },
  M: { lbl: `Mission`, c: `info.main`, bg: `rgba(2,136,209,.12)` },
  T: { lbl: `Télétravail`, c: `#7e3ff2`, bg: `rgba(126,63,242,.12)` },
  F: { lbl: `Férié`, c: `text.disabled`, bg: `rgba(0,0,0,.06)` },
  V: { lbl: `Non pointé`, c: `text.disabled`, bg: `transparent` },
};
var PT_JNOM = [`Lun`, `Mar`, `Mer`, `Jeu`, `Ven`];
var PT_DEF = {
  heuresJour: 8,
  joursOuvrables: 5,
  seuilTaux: 80,
  seuilRetards: 2,
  delaiValid: 5,
};
var PT_JC_CACHE = {};
function ptHash(s2) {
  var h = 0;
  for (var i2 = 0; i2 < s2.length; i2++)
    h = (Math.imul(31, h) + s2.charCodeAt(i2)) | 0;
  return Math.abs(h);
}
function ptRng(seed) {
  var aa = seed | 0;
  return function () {
    aa = (aa + 1831565813) | 0;
    var t = Math.imul(aa ^ (aa >>> 15), 1 | aa);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function ptDatesSem(num, an) {
  var lundi = hsSemLundi(num, an);
  var out = [];
  for (var j2 = 0; j2 < 5; j2++)
    out.push(new Date(lundi.getTime() + j2 * 864e5).toISOString().slice(0, 10));
  return out;
}
function ptAgg(jours, fset, dates, par) {
  var p = 0,
    aa = 0,
    rt = 0;
  for (var j2 = 0; j2 < 5; j2++) {
    var raw = String((jours && jours[j2]) || `V`);
    var c = raw.split(`:`)[0];
    if (dates && dates[j2] && fset && fset.has(dates[j2]) && c === `V`) c = `F`;
    if (c === `P` || c === `M` || c === `T`) p++;
    else if (c === `A`) aa++;
    else if (c === `R`) {
      p++;
      rt += parseInt(raw.split(`:`)[1] || `0`, 10) || 0;
    }
  }
  var ouvr = dates ? dates.filter((d2) => !fset || !fset.has(d2)).length : 5;
  var taux = ouvr > 0 ? Math.min(100, Math.round((100 * p) / ouvr)) : 100;
  return { p: p, a: aa, rt: rt, taux: taux, ouvr: ouvr };
}
function ptJoursDe(r, fset) {
  if (r.jours) return r.jours;
  if (PT_JC_CACHE[r.id]) return PT_JC_CACHE[r.id];
  var si = hsSemInfo(r.semaine);
  if (!si) return {};
  var dates = ptDatesSem(si.num, si.an);
  var rng = ptRng(ptHash(r.id) + 7);
  var jours = {};
  var libres = [];
  for (var j2 = 0; j2 < 5; j2++) {
    if (fset.has(dates[j2])) jours[j2] = `F`;
    else libres.push(j2);
  }
  for (var i2 = libres.length - 1; i2 > 0; i2--) {
    var k2 = Math.floor(rng() * (i2 + 1));
    var tmp = libres[i2];
    libres[i2] = libres[k2];
    libres[k2] = tmp;
  }
  var cible = Math.max(0, Math.min(libres.length, r.jours_presents || 0));
  var cibleA = Math.max(
    0,
    Math.min(libres.length - cible, r.jours_absents || 0),
  );
  var restRT = r.retards_minutes || 0;
  for (i2 = 0; i2 < libres.length; i2++) {
    var jj = libres[i2];
    if (cible > 0) {
      cible--;
      if (restRT > 0 && rng() < 0.55) {
        var mn = Math.min(restRT, 10 + Math.floor(rng() * 25));
        restRT -= mn;
        jours[jj] = `R:` + mn;
      } else jours[jj] = rng() < 0.1 ? `M` : rng() < 0.22 ? `T` : `P`;
    } else if (cibleA > 0) {
      cibleA--;
      jours[jj] = `A`;
    } else jours[jj] = `V`;
  }
  PT_JC_CACHE[r.id] = jours;
  return jours;
}
var PT_SIM_CACHE = null;
function ptSim() {
  if (PT_SIM_CACHE) return PT_SIM_CACHE;
  function mb(seed) {
    return function () {
      seed = (seed + 1831565813) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  var rng = mb(98765);
  var emps = [
    `emp-001`,
    `emp-003`,
    `emp-005`,
    `emp-008`,
    `emp-009`,
    `emp-014`,
    `emp-017`,
  ];
  var cur = hsSemCourante();
  var curIdx = cur.an * 53 + cur.num;
  var fset = sldFset();
  var out = [];
  for (var an = 2025; an <= cur.an; an++) {
    var maxN = an === cur.an ? cur.num - 1 : 52;
    for (var n2 = 1; n2 <= maxN; n2++) {
      var lundi = hsSemLundi(n2, an);
      var dates = ptDatesSem(n2, an);
      var nbF = dates.filter((d2) => fset.has(d2)).length;
      var ouvr = Math.max(1, 5 - nbF);
      emps.forEach((eid) => {
        var recent = an === cur.an && n2 >= cur.num - 2;
        var rr = rng();
        var abs = recent
          ? rr < 0.18
            ? 1
            : 0
          : rr < 0.3
            ? rng() < 0.75
              ? 1
              : 2
            : 0;
        var pres = Math.max(0, Math.min(ouvr, ouvr - abs));
        if (pres + abs > ouvr) abs = ouvr - pres;
        var rt = rng() < 0.55 ? 0 : 5 + Math.floor(rng() * 40);
        var taux = Math.min(100, Math.round((100 * pres) / ouvr));
        var statut = recent ? `brouillon` : rng() < 0.93 ? `valide` : `rejete`;
        var hot = eid === `emp-014` && rng() < 0.3;
        if (hot && abs === 0 && rng() < 0.5) {
          rt += 15;
        }
        out.push({
          id: `pt-sim-` + an + `-` + n2 + `-` + eid,
          employee_id: eid,
          semaine: `S` + n2 + `-` + an,
          jours_presents: pres,
          jours_absents: abs,
          retards_minutes: rt,
          taux_presence: taux,
          statut: statut,
          valide_par: statut === `valide` ? PT_VALID : null,
          valide_le:
            statut === `valide`
              ? new Date(lundi.getTime() + 3 * 864e5).toISOString().slice(0, 10)
              : null,
          motif_rejet:
            statut === `rejete`
              ? `Justificatifs d'absence manquants — régularisation demandée`
              : null,
        });
      });
    }
  }
  PT_SIM_CACHE = out;
  return out;
}
var PT_SEED = null;
function ptSeed() {
  if (PT_SEED) return PT_SEED;
  PT_SEED = [
    {
      id: `pt1`,
      employee_id: `emp-001`,
      semaine: `S37-2025`,
      jours_presents: 5,
      jours_absents: 0,
      retards_minutes: 0,
      taux_presence: 100,
      statut: `valide`,
      valide_par: PT_VALID,
      valide_le: `2025-09-12`,
      motif_rejet: null,
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
      valide_par: PT_VALID,
      valide_le: `2025-09-12`,
      motif_rejet: null,
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
      valide_par: null,
      valide_le: null,
      motif_rejet: null,
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
      valide_par: PT_VALID,
      valide_le: `2025-09-12`,
      motif_rejet: null,
    },
  ];
  return PT_SEED;
}
function ptStore() {
  try {
    var raw = localStorage.getItem(PT_LS);
    if (raw) {
      var st = JSON.parse(raw);
      if (st && st.records && st.records.length) return st;
    }
  } catch (err) {}
  return { records: ptSeed().concat(ptSim()), meta: {} };
}
function ptSave(st) {
  try {
    localStorage.setItem(PT_LS, JSON.stringify(st));
  } catch (err) {}
}
function ptMeta(st) {
  var m = (st && st.meta) || {};
  return Object.assign({}, PT_DEF, m);
}
function PointageV2() {
  var nav = O(),
    ptFER = sldFset(),
    ptAuj = new Date().toISOString().slice(0, 10),
    ptCur = hsSemCourante();
  var stTick = (0, Q.useState)(0),
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
    stAn = (0, Q.useState)(() => hsAnAuto(ptStore().records)),
    an = stAn[0],
    setAn = stAn[1],
    stTri = (0, Q.useState)({ key: `lundi`, dir: `desc` }),
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
    stNew = (0, Q.useState)(!1),
    dlgNew = stNew[0],
    setDlgNew = stNew[1],
    stPar = (0, Q.useState)(!1),
    dlgPar = stPar[0],
    setDlgPar = stPar[1],
    stSel = (0, Q.useState)({}),
    sel = stSel[0],
    setSel = stSel[1],
    stRej = (0, Q.useState)(null),
    dlgRej = stRej[0],
    setDlgRej = stRej[1],
    stMotR = (0, Q.useState)(``),
    motRej = stMotR[0],
    setMotRej = stMotR[1],
    stCh = (0, Q.useState)(0),
    chOpen = stCh[0],
    setCh = stCh[1],
    stEmpN = (0, Q.useState)(``),
    empNew = stEmpN[0],
    setEmpNew = stEmpN[1],
    stAnN = (0, Q.useState)(() => ptCur.an),
    anNew = stAnN[0],
    setAnNew = stAnN[1],
    stNmN = (0, Q.useState)(() => ptCur.num),
    nmNew = stNmN[0],
    setNmNew = stNmN[1],
    stJN = (0, Q.useState)(() => [0, 0, 0, 0, 0].map(() => `P`)),
    jNew = stJN[0],
    setJNew = stJN[1],
    stRtN = (0, Q.useState)(``),
    rtNew = stRtN[0],
    setRtNew = stRtN[1],
    stCell = (0, Q.useState)(null),
    dlgCell = stCell[0],
    setDlgCell = stCell[1],
    stCellC = (0, Q.useState)(`P`),
    cellC = stCellC[0],
    setCellC = stCellC[1],
    stCellM = (0, Q.useState)(`15`),
    cellM = stCellM[0],
    setCellM = stCellM[1],
    stSemGr = (0, Q.useState)({ num: ptCur.num, an: ptCur.an }),
    semGr = stSemGr[0],
    setSemGr = stSemGr[1],
    stPq = (0, Q.useState)(``),
    pHj = stPq[0],
    setPHj = stPq[1],
    stPa = (0, Q.useState)(``),
    pJo = stPa[0],
    setPJo = stPa[1],
    stPt = (0, Q.useState)(``),
    pSt = stPt[0],
    setPSt = stPt[1],
    stPr = (0, Q.useState)(``),
    pSr = stPr[0],
    setPSr = stPr[1],
    stPd = (0, Q.useState)(``),
    pDv = stPd[0],
    setPDv = stPd[1];
  var depts = (0, Q.useMemo)(() => {
    var s2 = new Set();
    H.forEach((e2) => e2.departement && s2.add(e2.departement));
    return Array.from(s2).sort();
  }, []);
  var mt = (0, Q.useMemo)(() => ptMeta(ptStore()), [tick]);
  var ALL = (0, Q.useMemo)(() => {
    var base = ptStore()
      .records.map((r) => {
        var si = hsSemInfo(r.semaine);
        var emp = R(r.employee_id);
        var lundi = si ? hsSemLundi(si.num, si.an) : null;
        var dates = si ? ptDatesSem(si.num, si.an) : [];
        var jours = si ? ptJoursDe(r, ptFER) : {};
        return Object.assign({}, r, {
          si: si,
          emp: emp,
          an: si ? si.an : 0,
          num: si ? si.num : 0,
          lundi: lundi,
          dates: dates,
          jours: jours,
          nbJoursR: [0, 1, 2, 3, 4].filter(
            (j2) => String(jours[j2] || `V`).split(`:`)[0] === `R`,
          ).length,
        });
      })
      .filter((r) => r.si);
    base.forEach((r) => {
      r.retardValid =
        r.statut === `brouillon` && r.lundi
          ? Date.now() - new Date(r.lundi.getTime() + 4 * 864e5).getTime() >
            mt.delaiValid * 864e5
          : !1;
      r.tauxBas = r.taux_presence < mt.seuilTaux;
      r.retardsRepetes = r.nbJoursR >= mt.seuilRetards;
    });
    return base;
  }, [tick]);
  var allAn = (0, Q.useMemo)(
    () => ALL.filter((r) => String(r.an) === String(an)),
    [ALL, an],
  );
  var srt = (0, Q.useMemo)(() => {
    var out = allAn.filter((r) => {
      var emp = r.emp ? B(r.emp).toLowerCase() : ``;
      if (rech) {
        var q2 = rech.toLowerCase();
        if (
          !emp.includes(q2) &&
          !String(r.semaine).toLowerCase().includes(q2) &&
          !((r.emp && r.emp.matricule) || ``).toLowerCase().includes(q2)
        )
          return !1;
      }
      if (dept !== `tous` && (!r.emp || r.emp.departement !== dept)) return !1;
      if (statutF === `taux_bas` && !r.tauxBas) return !1;
      else if (statutF === `retards` && !r.retardsRepetes) return !1;
      else if (statutF === `a_arbitrer` && !r.retardValid) return !1;
      else if (statutF === `absents` && !(r.jours_absents > 0)) return !1;
      else if (
        [`valide`, `brouillon`, `rejete`].indexOf(statutF) >= 0 &&
        r.statut !== statutF
      )
        return !1;
      return !0;
    });
    var f = {
      lundi: (r) => (r.lundi ? r.lundi.getTime() : 0),
      taux: (r) => r.taux_presence,
      retards: (r) => r.retards_minutes,
      absents: (r) => r.jours_absents,
      statut: (r) => r.statut,
      emp: (r) => (r.emp ? B(r.emp) : ``),
    };
    var kk = f[tri.key] || f.lundi;
    out.sort((x2, y2) => {
      var vx = kk(x2),
        vy = kk(y2);
      var c = vx < vy ? -1 : vx > vy ? 1 : 0;
      return tri.dir === `asc` ? c : -c;
    });
    return out;
  }, [allAn, rech, dept, statutF, tri]);
  var selCount = Object.keys(sel).length;
  var kpiSem = (0, Q.useMemo)(() => {
    var curIdx = ptCur.an * 53 + ptCur.num;
    var cand = ALL.filter((r) => {
      var idx = r.an * 53 + r.num;
      return idx <= curIdx && idx >= curIdx - 2;
    });
    var lastIdx = -1,
      la = null;
    cand.forEach((r) => {
      var idx = r.an * 53 + r.num;
      if (idx > lastIdx) {
        lastIdx = idx;
        la = r;
      }
    });
    if (!la) return { taux: null, d: 0, n: 0 };
    var idxLa = la.an * 53 + la.num;
    var prev = ALL.filter((r) => r.an * 53 + r.num === idxLa - 1);
    var tPrev = prev.length
      ? Math.round(
          prev.reduce((s2, r) => s2 + r.taux_presence, 0) / prev.length,
        )
      : null;
    var tLa = Math.round(
      ALL.filter((r) => r.an * 53 + r.num === idxLa).reduce(
        (s2, r) => s2 + r.taux_presence,
        0,
      ) / ALL.filter((r) => r.an * 53 + r.num === idxLa).length,
    );
    return {
      taux: tLa,
      d: tPrev == null ? 0 : tLa - tPrev,
      n: ALL.filter((r) => r.an * 53 + r.num === idxLa).length,
    };
  }, [ALL]);
  var kpiAtt = (0, Q.useMemo)(() => {
    var l2 = ALL.filter((r) => r.statut === `brouillon`);
    return { n: l2.length, enRetard: l2.filter((r) => r.retardValid).length };
  }, [ALL]);
  var kpiRet = (0, Q.useMemo)(() => {
    var l2 = allAn.filter((r) => r.retards_minutes > 0);
    return {
      min: l2.reduce((s2, r) => s2 + r.retards_minutes, 0),
      n: l2.length,
    };
  }, [allAn]);
  var kpiAbs = (0, Q.useMemo)(() => {
    var l2 = allAn.filter((r) => r.jours_absents > 0);
    return { j: l2.reduce((s2, r) => s2 + r.jours_absents, 0), n: l2.length };
  }, [allAn]);
  var empsGr = (0, Q.useMemo)(() => {
    var ids = [];
    ALL.forEach((r) => {
      if (dept !== `tous` && (!r.emp || r.emp.departement !== dept)) return;
      if (ids.indexOf(r.employee_id) < 0) ids.push(r.employee_id);
    });
    ids.sort((x2, y2) => {
      var ex = R(x2),
        ey = R(y2);
      return (ex ? B(ex) : ``).localeCompare(ey ? B(ey) : ``);
    });
    return ids.map((e2) => R(e2)).filter(Boolean);
  }, [ALL, dept]);
  var datesGr = (0, Q.useMemo)(() => ptDatesSem(semGr.num, semGr.an), [semGr]);
  var semGrLabel = `S` + semGr.num + `-` + semGr.an;
  var recGr = (0, Q.useMemo)(() => {
    var m2 = {};
    ALL.forEach((r) => {
      if (r.semaine === semGrLabel) m2[r.employee_id] = r;
    });
    return m2;
  }, [ALL, semGrLabel]);
  var pil = (0, Q.useMemo)(() => {
    var bySem = {};
    ALL.forEach((r) => {
      var k2 = r.an * 53 + r.num;
      if (!bySem[k2]) bySem[k2] = { num: r.num, an: r.an, t: 0, n: 0 };
      bySem[k2].t += r.taux_presence;
      bySem[k2].n += 1;
    });
    var keys = Object.keys(bySem)
      .map(Number)
      .sort((x2, y2) => x2 - y2)
      .slice(-12);
    var evol = keys.map((k2) => {
      var v2 = bySem[k2];
      return { sem: `S` + v2.num, taux: Math.round(v2.t / v2.n) };
    });
    var codes = { P: 0, R: 0, A: 0, M: 0, T: 0, F: 0 };
    var half = allAn.slice(Math.max(0, allAn.length - 60));
    half.forEach((r) => {
      for (var j2 = 0; j2 < 5; j2++) {
        var raw = String(r.jours[j2] || `V`);
        var c = raw.split(`:`)[0];
        if (r.dates[j2] && ptFER.has(r.dates[j2]) && c === `V`) c = `F`;
        if (codes[c] == null) codes[c] = 0;
        codes[c]++;
      }
    });
    var retards = {};
    half.forEach((r) => {
      if (r.retards_minutes > 0)
        retards[r.employee_id] =
          (retards[r.employee_id] || 0) + r.retards_minutes;
    });
    var top = Object.keys(retards)
      .map((e2) => ({ eid: e2, min: retards[e2] }))
      .sort((x2, y2) => y2.min - x2.min)
      .slice(0, 5);
    return { evol: evol, codes: codes, top: top, base: half.length };
  }, [ALL, allAn]);
  var majRecord = (r) => {
    var st = ptStore();
    st.records = st.records.map((x2) => (x2.id === r.id ? r : x2));
    ptSave(st);
    setTick(tick + 1);
  };
  var fValider = (ids, msg) => {
    var st = ptStore();
    var n = 0;
    st.records = st.records.map((x2) => {
      if (ids.indexOf(x2.id) >= 0 && x2.statut !== `valide`) {
        n++;
        return Object.assign({}, x2, {
          statut: `valide`,
          valide_par: PT_VALID,
          valide_le: ptAuj,
          motif_rejet: null,
        });
      }
      return x2;
    });
    ptSave(st);
    setSel({});
    setTick(tick + 1);
    setSnack({
      msg:
        msg ||
        n +
          ` pointage(s) hebdo validé(s) — prêt(s) pour l'export planning + paie.`,
      sev: `success`,
    });
  };
  var fRejeter = () => {
    if (!dlgRej) return;
    if (!motRej.trim()) {
      setSnack({ msg: `Motif de rejet obligatoire.`, sev: `error` });
      return;
    }
    var st = ptStore();
    st.records = st.records.map((x2) =>
      x2.id === dlgRej.id
        ? Object.assign({}, x2, {
            statut: `rejete`,
            motif_rejet: motRej.trim(),
            valide_par: PT_VALID,
            valide_le: ptAuj,
          })
        : x2,
    );
    ptSave(st);
    setSel({});
    setDlgRej(null);
    setMotRej(``);
    setTick(tick + 1);
    setSnack({
      msg: `Pointage rejeté — l'employé doit régulariser puis re-soumettre.`,
      sev: `warning`,
    });
  };
  var fReOuvrir = (rw) => {
    var st = ptStore();
    st.records = st.records.map((x2) =>
      x2.id === rw.id
        ? Object.assign({}, x2, {
            statut: `brouillon`,
            valide_par: null,
            valide_le: null,
          })
        : x2,
    );
    ptSave(st);
    setTick(tick + 1);
    setSnack({
      msg: `Pointage remis en brouillon — modifiable et re-soumissible.`,
      sev: `info`,
    });
  };
  var fToggle = (rw) => {
    if (rw.statut === `valide`) return;
    var s2 = Object.assign({}, sel);
    if (s2[rw.id]) delete s2[rw.id];
    else s2[rw.id] = 1;
    setSel(s2);
  };
  var fEnregistrerSaisie = () => {
    if (!empNew) {
      setSnack({ msg: `Sélectionnez un employé.`, sev: `error` });
      return;
    }
    var jours = {};
    var minRest = parseInt(rtNew, 10) || 0;
    for (var j2 = 0; j2 < 5; j2++) {
      var c = jNew[j2];
      var dateJ = ptDatesSem(nmNew, anNew)[j2];
      if (ptFER.has(dateJ) && c === `V`) jours[j2] = `F`;
      else if (c === `R`) jours[j2] = `R:` + (minRest > 0 ? minRest : 15);
      else jours[j2] = c;
    }
    var agg = ptAgg(jours, ptFER, ptDatesSem(nmNew, anNew));
    var st = ptStore();
    var semKey = `S` + nmNew + `-` + anNew;
    var exist = st.records.find(
      (x2) => x2.employee_id === empNew && x2.semaine === semKey,
    );
    if (exist) {
      Object.assign(exist, {
        jours_presents: agg.p,
        jours_absents: agg.a,
        retards_minutes: agg.rt,
        taux_presence: agg.taux,
        jours: jours,
        statut: `brouillon`,
        valide_par: null,
        valide_le: null,
      });
    } else {
      st.records.push({
        id: `pt-man-` + anNew + `-` + nmNew + `-` + empNew,
        employee_id: empNew,
        semaine: semKey,
        jours_presents: agg.p,
        jours_absents: agg.a,
        retards_minutes: agg.rt,
        taux_presence: agg.taux,
        statut: `brouillon`,
        valide_par: null,
        valide_le: null,
        motif_rejet: null,
        jours: jours,
      });
    }
    ptSave(st);
    setDlgNew(!1);
    setAn(String(anNew));
    setTick(tick + 1);
    setSnack({
      msg:
        `Pointage enregistré (brouillon) — ` +
        agg.p +
        ` j présents · ` +
        agg.a +
        ` j absents · ` +
        agg.rt +
        ` min retards · taux ` +
        agg.taux +
        ` %. Validation manager requise.`,
      sev: `success`,
    });
  };
  var fEditCell = () => {
    if (!dlgCell) return;
    var eid = dlgCell.eid;
    var j2 = dlgCell.j;
    var st = ptStore();
    var semKey = semGrLabel;
    var exist = st.records.find(
      (x2) => x2.employee_id === eid && x2.semaine === semKey,
    );
    var jours;
    if (exist)
      jours = Object.assign({}, exist.jours || ptJoursDe(exist, ptFER));
    else jours = Object.assign({}, (recGr[eid] && recGr[eid].jours) || {});
    var wasValide = exist && exist.statut === `valide`;
    jours[j2] = cellC === `R` ? `R:` + (parseInt(cellM, 10) || 15) : cellC;
    var agg = ptAgg(jours, ptFER, datesGr);
    var rec;
    if (exist) {
      Object.assign(exist, {
        jours_presents: agg.p,
        jours_absents: agg.a,
        retards_minutes: agg.rt,
        taux_presence: agg.taux,
        jours: jours,
      });
      if (wasValide) {
        exist.statut = `brouillon`;
        exist.valide_par = null;
        exist.valide_le = null;
      }
      rec = exist;
    } else {
      rec = {
        id: `pt-man-` + semGr.an + `-` + semGr.num + `-` + eid,
        employee_id: eid,
        semaine: semKey,
        jours_presents: agg.p,
        jours_absents: agg.a,
        retards_minutes: agg.rt,
        taux_presence: agg.taux,
        statut: `brouillon`,
        valide_par: null,
        valide_le: null,
        motif_rejet: null,
        jours: jours,
      };
      st.records.push(rec);
    }
    ptSave(st);
    setDlgCell(null);
    setTick(tick + 1);
    setSnack({
      msg:
        (wasValide
          ? `Modification après validation — revalidation manager requise. `
          : ``) +
        PT_JNOM[j2] +
        ` → ` +
        PT_JC[cellC].lbl +
        ` · semaine ` +
        agg.p +
        ` j / ` +
        agg.rt +
        ` min · taux ` +
        agg.taux +
        ` %`,
      sev: `success`,
    });
  };
  var fSavePar = () => {
    var st = ptStore();
    st.meta = Object.assign({}, st.meta, {
      heuresJour: parseInt(pHj, 10) || mt.heuresJour,
      joursOuvrables: parseInt(pJo, 10) || mt.joursOuvrables,
      seuilTaux: parseInt(pSt, 10) || mt.seuilTaux,
      seuilRetards: parseInt(pSr, 10) || mt.seuilRetards,
      delaiValid: parseInt(pDv, 10) || mt.delaiValid,
    });
    ptSave(st);
    setDlgPar(!1);
    setTick(tick + 1);
    setSnack({
      msg: `Paramètres de pointage enregistrés (persistants).`,
      sev: `success`,
    });
  };
  var ptCvsRows = (rows) => {
    var out = [
      [
        `Matricule`,
        `Employé`,
        `Département`,
        `Semaine`,
        `Semaine du`,
        `Lun`,
        `Mar`,
        `Mer`,
        `Jeu`,
        `Ven`,
        `Présents (j)`,
        `Absents (j)`,
        `Retards (min)`,
        `Heures ouvrées`,
        `Taux présence (%)`,
        `Statut`,
        `Validé par`,
        `Validé le`,
        `Motif rejet`,
      ],
    ];
    rows.forEach((r) => {
      var codes = [0, 1, 2, 3, 4].map((j2) => {
        var raw = String(r.jours[j2] || `V`);
        var c = raw.split(`:`)[0];
        var mn = raw.split(`:`)[1];
        if (r.dates[j2] && ptFER.has(r.dates[j2]) && c === `V`) return `Férié`;
        return (
          (PT_JC[c] || PT_JC.V).lbl + (c === `R` && mn ? ` ` + mn + `min` : ``)
        );
      });
      out.push(
        [
          (r.emp && r.emp.matricule) || `—`,
          r.emp ? B(r.emp) : r.employee_id,
          (r.emp && r.emp.departement) || `—`,
          r.semaine,
          r.lundi ? A(r.lundi.toISOString().slice(0, 10)) : `—`,
        ]
          .concat(codes)
          .concat([
            r.jours_presents,
            r.jours_absents,
            r.retards_minutes,
            r.jours_presents * mt.heuresJour,
            r.taux_presence,
            (PT_ST[r.statut] || [r.statut])[0],
            r.valide_par && R(r.valide_par) ? B(R(r.valide_par)) : `—`,
            r.valide_le || `—`,
            r.motif_rejet || ``,
          ])
          .map((x2) =>
            String(x2 == null ? `` : x2)
              .replace(/;/g, `,`)
              .replace(/\n/g, ` `),
          ),
      );
    });
    return out;
  };
  var ptCsvDl = (rows, nom, msg) => {
    var blb = new Blob(
      [
        `﻿` +
          ptCvsRows(rows).map((l2) => l2.join(`;`)).join(`
`),
      ],
      { type: `text/csv;charset=utf-8` },
    );
    var url = URL.createObjectURL(blb);
    var lk = document.createElement(`a`);
    ((lk.href = url), (lk.download = nom), lk.click());
    setSnack({ msg: msg, sev: `success` });
  };
  var fExport = () =>
    ptCsvDl(
      srt,
      `pointage_hebdo_` + ptAuj + `.csv`,
      srt.length +
        ` pointage(s) exporté(s) — fichier prêt paie (valeurs réelles, détail journalier).`,
    );
  var fExportPaie = () => {
    var l2 = allAn.filter((r) => r.statut === `valide`);
    if (!l2.length) {
      setSnack({
        msg: `Aucun pointage validé pour l'exercice ` + an + `.`,
        sev: `warning`,
      });
      return;
    }
    ptCsvDl(
      l2,
      `pointage_pretpaie_` + an + `.csv`,
      l2.length + ` pointage(s) VALIDÉ(S) exporté(s) — lot prêt paie.`,
    );
  };
  var fTri = (key) =>
    setTri({
      key: key,
      dir: tri.key === key && tri.dir === `asc` ? `desc` : `asc`,
    });
  var fTh = (label, key, align) =>
    (0, $.jsx)(
      v,
      {
        align: align || `left`,
        sx: {
          fontWeight: 700,
          whiteSpace: `nowrap`,
          bgcolor: `background.default`,
        },
        children: key
          ? (0, $.jsxs)(a, {
              sx: {
                display: `inline-flex`,
                alignItems: `center`,
                gap: 0.5,
                cursor: `pointer`,
                userSelect: `none`,
                "&:hover": { color: `primary.main` },
              },
              onClick: () => fTri(key),
              children: [
                label,
                tri.key === key
                  ? (0, $.jsx)(tri.dir === `asc` ? AU : AD, {
                      sx: { fontSize: 15, color: `primary.main` },
                    })
                  : (0, $.jsx)(a, { sx: { width: 15 } }),
              ],
            })
          : label,
      },
      label,
    );
  var bandAlert =
    kpiAtt.enRetard > 0
      ? kpiAtt.enRetard +
        ` pointage(s) hebdo en attente de validation depuis plus de ` +
        mt.delaiValid +
        ` jours — action manager requise avant export paie.`
      : null;
  var semGrNavi = (d2) => {
    var n2 = semGr.num + d2;
    var aa = semGr.an;
    if (n2 < 1) {
      n2 = 52;
      aa--;
    }
    if (n2 > 52) {
      n2 = 1;
      aa++;
    }
    setSemGr({ num: n2, an: aa });
  };
  return (0, $.jsxs)(o, {
    spacing: 2.5,
    sx: { width: `100%`, maxWidth: `100%`, minWidth: 0 },
    children: [
      (0, $.jsx)(J, {
        title: `Pointage de présence — Journal hebdo, validation manager & prêt paie`,
        subtitle:
          `Exercice ` +
          an +
          ` · ` +
          allAn.length +
          ` semaine(s) pointée(s) · Saisie quotidienne → validation hebdo manager OBLIGATOIRE → export planning + paie (art. 90 CT)`,
        action: (0, $.jsxs)(o, {
          direction: `row`,
          spacing: 1,
          children: [
            (0, $.jsx)(l, {
              variant: `outlined`,
              size: `small`,
              startIcon: (0, $.jsx)(RF, {}),
              onClick: () => {
                (setTick(tick + 1),
                  setSnack({
                    msg: `Données recalculées — seed + historique + pointages locaux.`,
                    sev: `success`,
                  }));
              },
              sx: { textTransform: `none`, fontSize: `0.72rem` },
              children: `Recalculer`,
            }),
            (0, $.jsx)(l, {
              variant: `outlined`,
              size: `small`,
              startIcon: (0, $.jsx)(x, {}),
              onClick: () => {
                (setEmpNew(``),
                  setAnNew(ptCur.an),
                  setNmNew(ptCur.num),
                  setJNew([`P`, `P`, `P`, `P`, `P`]),
                  setRtNew(``),
                  setDlgNew(!0));
              },
              sx: {
                textTransform: `none`,
                fontSize: `0.72rem`,
                borderColor: `#7e3ff2`,
                color: `#7e3ff2`,
              },
              children: `Pointer`,
            }),
            (0, $.jsx)(l, {
              variant: `outlined`,
              size: `small`,
              startIcon: (0, $.jsx)(CT, {}),
              onClick: () => {
                (setPHj(String(mt.heuresJour)),
                  setPJo(String(mt.joursOuvrables)),
                  setPSt(String(mt.seuilTaux)),
                  setPSr(String(mt.seuilRetards)),
                  setPDv(String(mt.delaiValid)),
                  setDlgPar(!0));
              },
              sx: { textTransform: `none`, fontSize: `0.72rem` },
              children: `Paramètres`,
            }),
            (0, $.jsx)(l, {
              variant: `outlined`,
              size: `small`,
              startIcon: (0, $.jsx)(S, {}),
              onClick: fExport,
              sx: { textTransform: `none`, fontSize: `0.72rem` },
              children: `Export CSV`,
            }),
          ],
        }),
      }),
      bandAlert
        ? (0, $.jsxs)(c, {
            severity: `warning`,
            icon: (0, $.jsx)(w, {}),
            sx: { mb: 0, fontWeight: 600 },
            children: [
              bandAlert + ` `,
              (0, $.jsx)(l, {
                size: `small`,
                variant: `outlined`,
                onClick: () => {
                  (setStatutF(`a_arbitrer`), setPage(0));
                },
                sx: { textTransform: `none`, fontSize: `0.7rem`, ml: 1 },
                children: `Traiter`,
              }),
            ],
          })
        : null,
      (0, $.jsxs)(a, {
        sx: {
          display: `grid`,
          gridTemplateColumns: { xs: `1fr 1fr`, md: `repeat(4,1fr)` },
          gap: 1.5,
        },
        children: [
          (0, $.jsx)(AbsKpi, {
            ic: CT,
            grad: statutF === `tous`,
            actif: statutF === `taux_bas`,
            couleur:
              kpiSem.taux != null && kpiSem.taux < mt.seuilTaux
                ? `error.main`
                : `success.main`,
            onClic: () => {
              (setStatutF(statutF === `taux_bas` ? `tous` : `taux_bas`),
                setPage(0));
            },
            valeur: kpiSem.taux == null ? `—` : kpiSem.taux + ` %`,
            label: `Taux de présence — dernière semaine pointée`,
            sub:
              (kpiSem.d > 0 ? `▲ +` : kpiSem.d < 0 ? `▼ ` : `= `) +
              Math.abs(kpiSem.d) +
              ` pts vs semaine précédente · ` +
              kpiSem.n +
              ` pointage(s) · cliquez pour filtrer < ` +
              mt.seuilTaux +
              ` %`,
          }),
          (0, $.jsx)(AbsKpi, {
            ic: HEA,
            actif: statutF === `brouillon`,
            couleur: kpiAtt.n > 0 ? `warning.main` : `success.main`,
            onClic: () => {
              (setStatutF(statutF === `brouillon` ? `tous` : `brouillon`),
                setPage(0));
            },
            valeur: String(kpiAtt.n),
            label: `Brouillons à valider`,
            sub:
              kpiAtt.n > 0
                ? kpiAtt.enRetard +
                  ` en retard (> ` +
                  mt.delaiValid +
                  ` j) — validation hebdo manager obligatoire`
                : `Tout est validé`,
          }),
          (0, $.jsx)(AbsKpi, {
            ic: AT,
            actif: statutF === `retards`,
            couleur: kpiRet.min > 0 ? `warning.main` : `success.main`,
            onClic: () => {
              (setStatutF(statutF === `retards` ? `tous` : `retards`),
                setPage(0));
            },
            valeur: kpiRet.min + ` min`,
            label: `Retards cumulés ` + an,
            sub:
              kpiRet.n +
              ` semaine(s) avec retard · seuil alerte ≥ ` +
              mt.seuilRetards +
              ` jours de retard`,
          }),
          (0, $.jsx)(AbsKpi, {
            ic: SCH,
            actif: statutF === `absents`,
            couleur: kpiAbs.j > 0 ? `error.main` : `success.main`,
            onClic: () => {
              (setStatutF(statutF === `absents` ? `tous` : `absents`),
                setPage(0));
            },
            valeur: kpiAbs.j + ` j`,
            label: `Jours d'absence ` + an,
            sub: kpiAbs.n + ` semaine(s) concernée(s) — cliquez pour filtrer`,
          }),
        ],
      }),
      selCount > 0
        ? (0, $.jsx)(ee, {
            sx: {
              p: 1.2,
              borderRadius: 2,
              border: `1px solid #7e3ff2`,
              bgcolor: `rgba(126,63,242,.04)`,
              display: `flex`,
              alignItems: `center`,
              gap: 1.5,
              flexWrap: `wrap`,
            },
            children: [
              (0, $.jsx)(i, {
                variant: `body2`,
                fontWeight: 700,
                children:
                  selCount +
                  ` semaine(s) sélectionnée(s) — clic sur une ligne pour sélectionner/désélectionner`,
              }),
              (0, $.jsx)(l, {
                variant: `contained`,
                size: `small`,
                onClick: () => fValider(Object.keys(sel)),
                sx: {
                  textTransform: `none`,
                  fontSize: `0.75rem`,
                  bgcolor: `#7e3ff2`,
                },
                children: `Valider la sélection`,
              }),
              (0, $.jsx)(l, {
                size: `small`,
                onClick: () => setSel({}),
                sx: { textTransform: `none`, fontSize: `0.75rem` },
                children: `Annuler`,
              }),
            ],
          })
        : null,
      (0, $.jsx)(ee, {
        sx: { p: 1.5, borderRadius: 3 },
        children: (0, $.jsxs)(o, {
          direction: { xs: `column`, md: `row` },
          spacing: 1.2,
          sx: { alignItems: { md: `center` } },
          children: [
            (0, $.jsx)(D, {
              size: `small`,
              placeholder: `Rechercher (nom, matricule, semaine…)`,
              value: rech,
              onChange: (e2) => {
                (setRech(e2.target.value), setPage(0));
              },
              InputProps: {
                startAdornment: (0, $.jsx)(k, {
                  sx: { fontSize: 18, mr: 1, color: `text.secondary` },
                }),
              },
              sx: {
                flex: 2,
                minWidth: 0,
                "& .MuiInput-root": { fontSize: `0.8rem` },
              },
            }),
            (0, $.jsxs)(D, {
              select: !0,
              size: `small`,
              label: `Département`,
              value: dept,
              onChange: (e2) => {
                (setDept(e2.target.value), setPage(0));
              },
              sx: {
                minWidth: 150,
                "& .MuiInput-root": { fontSize: `0.78rem` },
              },
              children: [
                (0, $.jsx)(s, { value: `tous`, children: `Tous départements` }),
                depts.map((d2) =>
                  (0, $.jsx)(s, { value: d2, children: d2 }, d2),
                ),
              ],
            }),
            (0, $.jsxs)(D, {
              select: !0,
              size: `small`,
              label: `Statut / alerte`,
              value: statutF,
              onChange: (e2) => {
                (setStatutF(e2.target.value), setPage(0));
              },
              sx: {
                minWidth: 175,
                "& .MuiInput-root": { fontSize: `0.78rem` },
              },
              children: [
                (0, $.jsx)(s, { value: `tous`, children: `Tous statuts` }),
                (0, $.jsx)(s, {
                  value: `brouillon`,
                  children: `Brouillons à valider`,
                }),
                (0, $.jsx)(s, { value: `valide`, children: `Validés` }),
                (0, $.jsx)(s, { value: `rejete`, children: `Rejetés` }),
                (0, $.jsx)(s, {
                  value: `a_arbitrer`,
                  children: `⚠ À arbitrer (> délai)`,
                }),
                (0, $.jsx)(s, {
                  value: `taux_bas`,
                  children: `⚠ Taux < seuil`,
                }),
                (0, $.jsx)(s, {
                  value: `retards`,
                  children: `⚠ Retards répétés`,
                }),
                (0, $.jsx)(s, {
                  value: `absents`,
                  children: `⚠ Avec absences`,
                }),
              ],
            }),
            (0, $.jsxs)(D, {
              select: !0,
              size: `small`,
              label: `Exercice`,
              value: an,
              onChange: (e2) => {
                (setAn(e2.target.value), setPage(0));
              },
              sx: {
                minWidth: 105,
                "& .MuiInput-root": { fontSize: `0.78rem` },
              },
              children: (() => {
                var set = {};
                ptStore().records.forEach((r) => {
                  var si = hsSemInfo(r.semaine);
                  if (si) set[si.an] = 1;
                });
                return Object.keys(set)
                  .sort()
                  .reverse()
                  .map((y2) => (0, $.jsx)(s, { value: y2, children: y2 }, y2));
              })(),
            }),
          ],
        }),
      }),
      (0, $.jsx)(y, {
        sx: { borderRadius: 2, border: `1px solid`, borderColor: `divider` },
        children: (0, $.jsxs)(ne, {
          size: `small`,
          stickyHeader: !0,
          sx: { "& .MuiTableCell-root": { fontSize: `0.78rem` } },
          children: [
            (0, $.jsx)(te, {
              children: (0, $.jsxs)(b, {
                sx: { bgcolor: `background.default` },
                children: [
                  fTh(`Employé`, `emp`),
                  fTh(`Semaine`, `lundi`),
                  fTh(`Présents`, `presents`, `right`),
                  fTh(`Absents`, `absents`, `right`),
                  fTh(`Retards`, `retards`, `right`),
                  fTh(`Heures`, null, `right`),
                  fTh(`Taux présence`, `taux`),
                  fTh(`Statut`, `statut`),
                  (0, $.jsx)(v, {
                    align: `center`,
                    sx: { fontWeight: 700 },
                    children: `Actions`,
                  }),
                ],
              }),
            }),
            (0, $.jsxs)(_, {
              children: [
                srt.slice(page * pp, page * pp + pp).map((rw) =>
                  (0, $.jsxs)(
                    b,
                    {
                      hover: !0,
                      onClick: () => fToggle(rw),
                      sx: {
                        cursor: rw.statut === `valide` ? `default` : `pointer`,
                        bgcolor: sel[rw.id]
                          ? `rgba(126,63,242,.08)`
                          : undefined,
                      },
                      children: [
                        (0, $.jsx)(v, {
                          children: (0, $.jsxs)(a, {
                            sx: {
                              display: `flex`,
                              alignItems: `center`,
                              gap: 1.2,
                            },
                            children: [
                              sldAvatar(rw.emp, 32, 11),
                              (0, $.jsxs)(a, {
                                sx: { minWidth: 0 },
                                children: [
                                  (0, $.jsx)(i, {
                                    variant: `body2`,
                                    fontWeight: 700,
                                    noWrap: !0,
                                    children: rw.emp
                                      ? B(rw.emp)
                                      : rw.employee_id,
                                  }),
                                  (0, $.jsx)(i, {
                                    variant: `caption`,
                                    sx: {
                                      color: `text.secondary`,
                                      fontFamily: `monospace`,
                                    },
                                    children:
                                      (rw.emp && rw.emp.matricule) || `—`,
                                  }),
                                ],
                              }),
                            ],
                          }),
                        }),
                        (0, $.jsxs)(v, {
                          children: [
                            (0, $.jsx)(T, {
                              label: rw.semaine,
                              size: `small`,
                              variant: `outlined`,
                              sx: { fontWeight: 700, fontSize: `0.68rem` },
                            }),
                            (0, $.jsx)(i, {
                              variant: `caption`,
                              sx: { display: `block`, color: `text.secondary` },
                              children: rw.lundi
                                ? `sem. du ` +
                                  A(rw.lundi.toISOString().slice(0, 10))
                                : `—`,
                            }),
                          ],
                        }),
                        (0, $.jsx)(v, {
                          align: `right`,
                          children: (0, $.jsx)(i, {
                            variant: `body2`,
                            fontWeight: 700,
                            children: rw.jours_presents + ` j`,
                          }),
                        }),
                        (0, $.jsx)(v, {
                          align: `right`,
                          children:
                            rw.jours_absents > 0
                              ? (0, $.jsx)(i, {
                                  variant: `body2`,
                                  fontWeight: 800,
                                  sx: { color: `error.main` },
                                  children: rw.jours_absents + ` j`,
                                })
                              : (0, $.jsx)(i, {
                                  variant: `body2`,
                                  sx: { color: `text.disabled` },
                                  children: `0 j`,
                                }),
                        }),
                        (0, $.jsxs)(v, {
                          align: `right`,
                          children: [
                            (0, $.jsx)(i, {
                              variant: `body2`,
                              fontWeight: rw.retards_minutes > 0 ? 800 : 400,
                              sx: {
                                color:
                                  rw.retards_minutes > 0
                                    ? `warning.main`
                                    : `text.disabled`,
                              },
                              children:
                                rw.retards_minutes > 0
                                  ? rw.retards_minutes + ` min`
                                  : `—`,
                            }),
                            rw.retardsRepetes
                              ? (0, $.jsx)(i, {
                                  variant: `caption`,
                                  sx: {
                                    display: `block`,
                                    color: `warning.main`,
                                    fontWeight: 700,
                                  },
                                  children:
                                    `⚠ ` + rw.nbJoursR + ` jours de retard`,
                                })
                              : null,
                          ],
                        }),
                        (0, $.jsx)(v, {
                          align: `right`,
                          children: (0, $.jsx)(i, {
                            variant: `body2`,
                            fontWeight: 700,
                            children: rw.jours_presents * mt.heuresJour + ` h`,
                          }),
                        }),
                        (0, $.jsxs)(v, {
                          children: [
                            (0, $.jsx)(X, {
                              value: rw.taux_presence,
                              max: 100,
                              label: rw.taux_presence + `%`,
                            }),
                            rw.tauxBas
                              ? (0, $.jsx)(i, {
                                  variant: `caption`,
                                  sx: {
                                    display: `block`,
                                    color: `error.main`,
                                    fontWeight: 700,
                                  },
                                  children: `< seuil ` + mt.seuilTaux + ` %`,
                                })
                              : null,
                          ],
                        }),
                        (0, $.jsxs)(v, {
                          children: [
                            (0, $.jsx)(q, {
                              status: rw.statut,
                              label: (PT_ST[rw.statut] || [rw.statut])[0],
                            }),
                            rw.retardValid
                              ? (0, $.jsx)(i, {
                                  variant: `caption`,
                                  sx: {
                                    display: `block`,
                                    color: `warning.main`,
                                    fontWeight: 700,
                                    mt: 0.5,
                                  },
                                  children: `à arbitrer`,
                                })
                              : rw.statut === `valide` && rw.valide_le
                                ? (0, $.jsx)(i, {
                                    variant: `caption`,
                                    sx: {
                                      display: `block`,
                                      color: `text.secondary`,
                                      mt: 0.5,
                                    },
                                    children:
                                      `par ` +
                                      (rw.valide_par && R(rw.valide_par)
                                        ? B(R(rw.valide_par)).split(` `)[0]
                                        : `—`) +
                                      ` · ` +
                                      rw.valide_le,
                                  })
                                : rw.statut === `rejete` && rw.motif_rejet
                                  ? (0, $.jsx)(i, {
                                      variant: `caption`,
                                      sx: {
                                        display: `block`,
                                        color: `error.main`,
                                        mt: 0.5,
                                      },
                                      children:
                                        rw.motif_rejet.slice(0, 42) +
                                        (rw.motif_rejet.length > 42 ? `…` : ``),
                                    })
                                  : null,
                          ],
                        }),
                        (0, $.jsx)(v, {
                          children: (0, $.jsxs)(a, {
                            sx: {
                              display: `flex`,
                              gap: 0.5,
                              alignItems: `center`,
                              minWidth: 150,
                            },
                            children: [
                              (0, $.jsx)(l, {
                                size: `small`,
                                onClick: (e2) => {
                                  (e2.stopPropagation(), setDetail(rw));
                                },
                                sx: { minWidth: 0, px: 1 },
                                title: `Fiche détail`,
                                children: (0, $.jsx)(C, {
                                  sx: { fontSize: 18 },
                                }),
                              }),
                              rw.statut === `brouillon`
                                ? (0, $.jsx)(l, {
                                    size: `small`,
                                    variant: `outlined`,
                                    onClick: (e2) => {
                                      (e2.stopPropagation(), fValider([rw.id]));
                                    },
                                    sx: {
                                      textTransform: `none`,
                                      fontSize: `0.68rem`,
                                      minWidth: 0,
                                      px: 1,
                                      color: `success.main`,
                                      borderColor: `success.main`,
                                    },
                                    children: `Valider`,
                                  })
                                : null,
                              rw.statut !== `rejete`
                                ? (0, $.jsx)(l, {
                                    size: `small`,
                                    onClick: (e2) => {
                                      (e2.stopPropagation(),
                                        setMotRej(``),
                                        setDlgRej(rw));
                                    },
                                    sx: {
                                      textTransform: `none`,
                                      fontSize: `0.68rem`,
                                      minWidth: 0,
                                      px: 1,
                                      color: `error.main`,
                                    },
                                    children: `Rejeter`,
                                  })
                                : (0, $.jsx)(l, {
                                    size: `small`,
                                    onClick: (e2) => {
                                      (e2.stopPropagation(), fReOuvrir(rw));
                                    },
                                    sx: {
                                      textTransform: `none`,
                                      fontSize: `0.68rem`,
                                      minWidth: 0,
                                      px: 1,
                                    },
                                    children: `Réouvrir`,
                                  }),
                            ],
                          }),
                        }),
                      ],
                    },
                    rw.id,
                  ),
                ),
                srt.length === 0
                  ? (0, $.jsx)(b, {
                      children: (0, $.jsx)(v, {
                        colSpan: 9,
                        align: `center`,
                        sx: { py: 4, color: `text.secondary` },
                        children: `Aucun pointage ne correspond aux filtres`,
                      }),
                    })
                  : null,
              ],
            }),
          ],
        }),
      }),
      (0, $.jsx)(g, {
        component: `div`,
        count: srt.length,
        page: page,
        onPageChange: (e2, v2) => setPage(v2),
        rowsPerPage: pp,
        onRowsPerPageChange: (e2) => {
          (setPp(parseInt(e2.target.value, 10)), setPage(0));
        },
        rowsPerPageOptions: [10, 20, 50],
        labelRowsPerPage: `Lignes :`,
        labelDisplayedRows: (pg2) =>
          pg2.from + `-` + pg2.to + ` sur ` + pg2.count,
        sx: { mt: -1 },
      }),
      (0, $.jsx)(ee, {
        sx: { borderRadius: 3 },
        children: (0, $.jsxs)(u, {
          children: [
            (0, $.jsxs)(a, {
              sx: {
                display: `flex`,
                alignItems: `center`,
                gap: 1,
                mb: 1.5,
                flexWrap: `wrap`,
              },
              children: [
                (0, $.jsx)(CT, { sx: { fontSize: 20, color: `#7e3ff2` } }),
                (0, $.jsx)(i, {
                  variant: `subtitle2`,
                  fontWeight: 800,
                  children: `Grille hebdomadaire — présence par jour (clic sur une cellule pour pointer)`,
                }),
                (0, $.jsx)(a, {
                  sx: {
                    ml: `auto`,
                    display: `flex`,
                    alignItems: `center`,
                    gap: 1,
                  },
                  children: [
                    (0, $.jsx)(l, {
                      size: `small`,
                      onClick: () => semGrNavi(-1),
                      sx: { minWidth: 0, px: 1, fontWeight: 800 },
                      children: `‹`,
                    }),
                    (0, $.jsx)(T, {
                      label:
                        semGrLabel +
                        ` (sem. du ` +
                        A(datesGr[0]) +
                        `)` +
                        (semGr.num === ptCur.num && semGr.an === ptCur.an
                          ? ` — en cours`
                          : ``),
                      size: `small`,
                      sx: {
                        fontWeight: 800,
                        fontSize: `0.72rem`,
                        color: `#7e3ff2`,
                        borderColor: `#7e3ff2`,
                      },
                      variant: `outlined`,
                    }),
                    (0, $.jsx)(l, {
                      size: `small`,
                      onClick: () => semGrNavi(1),
                      sx: { minWidth: 0, px: 1, fontWeight: 800 },
                      children: `›`,
                    }),
                    (0, $.jsx)(l, {
                      size: `small`,
                      onClick: () => setSemGr({ num: ptCur.num, an: ptCur.an }),
                      sx: {
                        textTransform: `none`,
                        fontSize: `0.7rem`,
                        minWidth: 0,
                      },
                      children: `Aujourd'hui`,
                    }),
                  ],
                }),
              ],
            }),
            (0, $.jsx)(y, {
              sx: {
                borderRadius: 2,
                border: `1px solid`,
                borderColor: `divider`,
              },
              children: (0, $.jsxs)(ne, {
                size: `small`,
                sx: { "& .MuiTableCell-root": { fontSize: `0.75rem` } },
                children: [
                  (0, $.jsx)(te, {
                    children: (0, $.jsxs)(b, {
                      sx: { bgcolor: `background.default` },
                      children: [
                        (0, $.jsx)(v, {
                          sx: { fontWeight: 700, whiteSpace: `nowrap` },
                          children: `Employé`,
                        }),
                        PT_JNOM.map((jn, jx) =>
                          (0, $.jsx)(
                            v,
                            {
                              align: `center`,
                              sx: { fontWeight: 700 },
                              children: [
                                jn,
                                (0, $.jsx)(i, {
                                  variant: `caption`,
                                  sx: {
                                    display: `block`,
                                    color: `text.secondary`,
                                  },
                                  children:
                                    (datesGr[jx] || `—`).slice(8) +
                                    `/` +
                                    (datesGr[jx] || `--`).slice(5, 7),
                                }),
                                datesGr[jx] && ptFER.has(datesGr[jx])
                                  ? (0, $.jsx)(i, {
                                      variant: `caption`,
                                      sx: {
                                        display: `block`,
                                        color: `warning.main`,
                                        fontWeight: 700,
                                      },
                                      children: `férié`,
                                    })
                                  : null,
                              ],
                            },
                            jn,
                          ),
                        ),
                        (0, $.jsx)(v, {
                          align: `center`,
                          sx: { fontWeight: 700 },
                          children: `Total`,
                        }),
                        (0, $.jsx)(v, {
                          align: `center`,
                          sx: { fontWeight: 700 },
                          children: `Statut`,
                        }),
                      ],
                    }),
                  }),
                  (0, $.jsxs)(_, {
                    children: [
                      empsGr.map((em) => {
                        var rg = recGr[em.id];
                        var jr = rg ? rg.jours || ptJoursDe(rg, ptFER) : {};
                        var agg = ptAgg(jr, ptFER, datesGr);
                        var tP = [0, 1, 2, 3, 4].filter((j2) => {
                          var c = String(jr[j2] || `V`).split(`:`)[0];
                          return (
                            c === `P` || c === `M` || c === `T` || c === `R`
                          );
                        }).length;
                        return (0, $.jsxs)(
                          b,
                          {
                            hover: !0,
                            children: [
                              (0, $.jsx)(v, {
                                children: (0, $.jsxs)(a, {
                                  sx: {
                                    display: `flex`,
                                    alignItems: `center`,
                                    gap: 1,
                                  },
                                  children: [
                                    sldAvatar(em, 28, 10),
                                    (0, $.jsx)(i, {
                                      variant: `body2`,
                                      fontWeight: 700,
                                      noWrap: !0,
                                      children: B(em),
                                    }),
                                  ],
                                }),
                              }),
                              [0, 1, 2, 3, 4].map((j2) => {
                                var dateJ = datesGr[j2];
                                var ferie = dateJ && ptFER.has(dateJ);
                                var raw = String(jr[j2] || `V`);
                                var c = raw.split(`:`)[0];
                                if (ferie && c === `V`) c = `F`;
                                var cfg = PT_JC[c] || PT_JC.V;
                                return (0, $.jsx)(
                                  v,
                                  {
                                    align: `center`,
                                    sx: { p: 0.5 },
                                    children: (0, $.jsx)(a, {
                                      onClick: () => {
                                        (setCellC(
                                          ferie && c === `F`
                                            ? `F`
                                            : c === `V` || c === `F`
                                              ? `P`
                                              : c,
                                        ),
                                          setCellM(raw.split(`:`)[1] || `15`),
                                          setDlgCell({
                                            eid: em.id,
                                            j: j2,
                                            emp: em,
                                            ferie: ferie,
                                          }));
                                      },
                                      title:
                                        B(em) +
                                        ` — ` +
                                        PT_JNOM[j2] +
                                        ` ` +
                                        (dateJ || ``) +
                                        (ferie ? ` (jour férié)` : ``) +
                                        ` — cliquer pour modifier`,
                                      sx: {
                                        display: `inline-flex`,
                                        alignItems: `center`,
                                        justifyContent: `center`,
                                        minWidth: 52,
                                        px: 1,
                                        py: 0.5,
                                        borderRadius: 1.5,
                                        cursor: `pointer`,
                                        bgcolor: cfg.bg,
                                        border: `1px solid`,
                                        borderColor:
                                          c === `V` ? `divider` : cfg.c,
                                        color: cfg.c,
                                        fontWeight: 800,
                                        fontSize: `0.68rem`,
                                        transition: `box-shadow .15s`,
                                        "&:hover": { boxShadow: 3 },
                                      },
                                      children:
                                        c === `R`
                                          ? `R · ` +
                                            (raw.split(`:`)[1] || `15′`)
                                          : c,
                                    }),
                                  },
                                  j2,
                                );
                              }),
                              (0, $.jsx)(v, {
                                align: `center`,
                                children: (0, $.jsx)(i, {
                                  variant: `body2`,
                                  fontWeight: 700,
                                  children: tP + ` j · ` + agg.rt + `′`,
                                }),
                              }),
                              (0, $.jsx)(v, {
                                align: `center`,
                                children: rg
                                  ? (0, $.jsx)(q, {
                                      status: rg.statut,
                                      label: (PT_ST[rg.statut] || [
                                        rg.statut,
                                      ])[0],
                                    })
                                  : (0, $.jsx)(i, {
                                      variant: `caption`,
                                      sx: { color: `text.disabled` },
                                      children: `non pointé`,
                                    }),
                              }),
                            ],
                          },
                          em.id,
                        );
                      }),
                      empsGr.length === 0
                        ? (0, $.jsx)(b, {
                            children: (0, $.jsx)(v, {
                              colSpan: 8,
                              align: `center`,
                              sx: { py: 3, color: `text.secondary` },
                              children: `Aucun employé pointé pour les filtres actifs — utilisez « Pointer » pour créer la première saisie.`,
                            }),
                          })
                        : null,
                    ],
                  }),
                ],
              }),
            }),
            (0, $.jsxs)(a, {
              sx: {
                display: `flex`,
                gap: 1.5,
                mt: 1.5,
                flexWrap: `wrap`,
                alignItems: `center`,
              },
              children: [
                (0, $.jsx)(i, {
                  variant: `caption`,
                  fontWeight: 700,
                  sx: { color: `text.secondary` },
                  children: `Légende :`,
                }),
                Object.keys(PT_JC).map((c2) =>
                  (0, $.jsxs)(
                    a,
                    {
                      sx: {
                        display: `inline-flex`,
                        alignItems: `center`,
                        gap: 0.5,
                      },
                      children: [
                        (0, $.jsx)(a, {
                          sx: {
                            width: 14,
                            height: 14,
                            borderRadius: 0.75,
                            bgcolor: PT_JC[c2].bg,
                            border: `1px solid`,
                            borderColor: PT_JC[c2].c,
                          },
                        }),
                        (0, $.jsx)(i, {
                          variant: `caption`,
                          sx: { color: `text.secondary` },
                          children: PT_JC[c2].lbl,
                        }),
                      ],
                    },
                    c2,
                  ),
                ),
              ],
            }),
          ],
        }),
      }),
      (0, $.jsx)(ee, {
        sx: { borderRadius: 3 },
        children: (0, $.jsxs)(u, {
          children: [
            (0, $.jsxs)(a, {
              sx: {
                display: `flex`,
                alignItems: `center`,
                gap: 1,
                flexWrap: `wrap`,
              },
              children: [
                (0, $.jsx)(AS2, { sx: { fontSize: 20, color: `#7e3ff2` } }),
                (0, $.jsx)(i, {
                  variant: `subtitle2`,
                  fontWeight: 800,
                  children: `Pilotage visuel — présence & ponctualité`,
                }),
                (0, $.jsx)(T, {
                  label:
                    (kpiSem.d > 0 ? `▲ +` : kpiSem.d < 0 ? `▼ ` : `= `) +
                    Math.abs(kpiSem.d) +
                    ` pts vs semaine précédente`,
                  size: `small`,
                  color:
                    kpiSem.d < 0
                      ? `success`
                      : kpiSem.d > 0
                        ? `error`
                        : `default`,
                  variant: `outlined`,
                  sx: { fontWeight: 800, fontSize: `0.68rem` },
                }),
                (0, $.jsx)(a, {
                  sx: {
                    ml: `auto`,
                    display: `flex`,
                    alignItems: `center`,
                    gap: 1,
                  },
                  children: [
                    (0, $.jsx)(l, {
                      variant: `outlined`,
                      size: `small`,
                      startIcon: (0, $.jsx)(PYC, {}),
                      onClick: fExportPaie,
                      sx: { textTransform: `none`, fontSize: `0.7rem` },
                      children: `Exporter les validés (prêt paie)`,
                    }),
                    (0, $.jsx)(l, {
                      size: `small`,
                      onClick: () => setCh(chOpen ? 0 : 1),
                      sx: {
                        textTransform: `none`,
                        fontSize: `0.72rem`,
                        minWidth: 0,
                      },
                      children: chOpen ? `Masquer` : `Afficher`,
                    }),
                  ],
                }),
              ],
            }),
            chOpen
              ? (0, $.jsxs)(a, {
                  sx: {
                    display: `grid`,
                    gridTemplateColumns: { xs: `1fr`, md: `1fr 1fr` },
                    gap: 3,
                    mt: 1.5,
                    overflowX: `auto`,
                  },
                  children: [
                    (0, $.jsxs)(a, {
                      children: [
                        (0, $.jsx)(i, {
                          variant: `caption`,
                          fontWeight: 800,
                          sx: {
                            color: `text.secondary`,
                            display: `block`,
                            mb: 1,
                          },
                          children:
                            `Évolution du taux de présence — 12 dernières semaines pointées (seuil ` +
                            mt.seuilTaux +
                            ` %)`,
                        }),
                        (0, $.jsx)(a, {
                          sx: {
                            display: `flex`,
                            alignItems: `flex-end`,
                            gap: 0.5,
                            height: 72,
                            maxWidth: `100%`,
                          },
                          children: pil.evol.map((v2) =>
                            (0, $.jsxs)(
                              a,
                              {
                                title: v2.sem + ` : ` + v2.taux + ` %`,
                                sx: {
                                  flex: 1,
                                  display: `flex`,
                                  flexDirection: `column`,
                                  justifyContent: `flex-end`,
                                  alignItems: `center`,
                                  gap: 0.25,
                                  minWidth: 0,
                                },
                                children: [
                                  (0, $.jsx)(i, {
                                    variant: `caption`,
                                    sx: {
                                      fontSize: `0.55rem`,
                                      fontWeight: 800,
                                    },
                                    children: String(v2.taux),
                                  }),
                                  (0, $.jsx)(a, {
                                    sx: {
                                      width: `100%`,
                                      height: Math.max(
                                        3,
                                        Math.round((v2.taux / 100) * 52),
                                      ),
                                      bgcolor:
                                        v2.taux < mt.seuilTaux
                                          ? `error.main`
                                          : v2.taux < 95
                                            ? `warning.main`
                                            : `success.main`,
                                      borderRadius: `3px 3px 0 0`,
                                    },
                                  }),
                                  (0, $.jsx)(i, {
                                    variant: `caption`,
                                    sx: {
                                      fontSize: `0.5rem`,
                                      color: `text.secondary`,
                                    },
                                    children: v2.sem,
                                  }),
                                ],
                              },
                              v2.sem,
                            ),
                          ),
                        }),
                        (0, $.jsx)(i, {
                          variant: `caption`,
                          fontWeight: 800,
                          sx: {
                            color: `text.secondary`,
                            display: `block`,
                            mb: 1,
                            mt: 2,
                          },
                          children:
                            `Répartition des jours pointés — ` +
                            pil.base +
                            ` semaine(s) analysée(s)`,
                        }),
                        (0, $.jsx)(a, {
                          sx: {
                            display: `flex`,
                            flexDirection: `column`,
                            gap: 1,
                          },
                          children: Object.keys(PT_JC).map((c2) => {
                            var tot = Object.keys(pil.codes).reduce(
                              (s2, k2) => s2 + pil.codes[k2],
                              0,
                            );
                            var n2 = pil.codes[c2] || 0;
                            return (0, $.jsxs)(
                              a,
                              {
                                sx: {
                                  display: `flex`,
                                  alignItems: `center`,
                                  gap: 1,
                                },
                                children: [
                                  (0, $.jsx)(a, {
                                    sx: { width: 92, flexShrink: 0 },
                                    children: (0, $.jsx)(i, {
                                      variant: `caption`,
                                      fontWeight: 700,
                                      children: PT_JC[c2].lbl,
                                    }),
                                  }),
                                  (0, $.jsx)(a, {
                                    sx: {
                                      flex: 1,
                                      height: 10,
                                      borderRadius: 5,
                                      bgcolor: `action.hover`,
                                      overflow: `hidden`,
                                    },
                                    children: (0, $.jsx)(a, {
                                      sx: {
                                        width:
                                          (tot
                                            ? Math.round((n2 / tot) * 100)
                                            : 0) + `%`,
                                        height: `100%`,
                                        bgcolor: PT_JC[c2].c,
                                      },
                                    }),
                                  }),
                                  (0, $.jsx)(i, {
                                    variant: `caption`,
                                    fontWeight: 800,
                                    sx: { width: 34, textAlign: `right` },
                                    children: String(n2),
                                  }),
                                ],
                              },
                              c2,
                            );
                          }),
                        }),
                      ],
                    }),
                    (0, $.jsxs)(a, {
                      children: [
                        (0, $.jsx)(i, {
                          variant: `caption`,
                          fontWeight: 800,
                          sx: {
                            color: `text.secondary`,
                            display: `block`,
                            mb: 1,
                          },
                          children: `Top retards par employé — minutes cumulées (cliquez pour filtrer)`,
                        }),
                        (0, $.jsx)(a, {
                          sx: {
                            display: `flex`,
                            flexDirection: `column`,
                            gap: 1,
                          },
                          children: pil.top.length
                            ? pil.top.map((t2) => {
                                var em = R(t2.eid);
                                var maxM = pil.top[0].min || 1;
                                return (0, $.jsxs)(
                                  a,
                                  {
                                    onClick: () => {
                                      (setRech(em ? B(em) : t2.eid),
                                        setPage(0));
                                      setSnack({
                                        msg:
                                          `Filtré sur ` +
                                          (em ? B(em) : t2.eid) +
                                          ` — retards ` +
                                          t2.min +
                                          ` min.`,
                                        sev: `info`,
                                      });
                                    },
                                    title:
                                      `Filtrer sur ` + (em ? B(em) : t2.eid),
                                    sx: {
                                      display: `flex`,
                                      alignItems: `center`,
                                      gap: 1,
                                      cursor: `pointer`,
                                      "&:hover": { bgcolor: `action.hover` },
                                      borderRadius: 1,
                                    },
                                    children: [
                                      (0, $.jsx)(a, {
                                        sx: { width: 140, flexShrink: 0 },
                                        children: (0, $.jsx)(i, {
                                          variant: `caption`,
                                          fontWeight: 700,
                                          noWrap: !0,
                                          children: em ? B(em) : t2.eid,
                                        }),
                                      }),
                                      (0, $.jsx)(a, {
                                        sx: {
                                          flex: 1,
                                          height: 10,
                                          borderRadius: 5,
                                          bgcolor: `action.hover`,
                                          overflow: `hidden`,
                                        },
                                        children: (0, $.jsx)(a, {
                                          sx: {
                                            width:
                                              Math.round(
                                                (t2.min / maxM) * 100,
                                              ) + `%`,
                                            height: `100%`,
                                            bgcolor: `warning.main`,
                                          },
                                        }),
                                      }),
                                      (0, $.jsx)(i, {
                                        variant: `caption`,
                                        fontWeight: 800,
                                        sx: { width: 52, textAlign: `right` },
                                        children: t2.min + ` min`,
                                      }),
                                    ],
                                  },
                                  t2.eid,
                                );
                              })
                            : (0, $.jsx)(i, {
                                variant: `caption`,
                                sx: { color: `text.secondary` },
                                children: `Aucun retard sur la période — ponctualité parfaite ✓`,
                              }),
                        }),
                      ],
                    }),
                  ],
                })
              : null,
          ],
        }),
      }),
      (0, $.jsx)(f, {
        open: dlgNew,
        onClose: () => setDlgNew(!1),
        maxWidth: `md`,
        fullWidth: !0,
        children: [
          (0, $.jsx)(h, {
            sx: { fontWeight: 800 },
            children: `Saisie rapide — pointage hebdomadaire`,
          }),
          (0, $.jsxs)(p, {
            sx: { display: `flex`, flexDirection: `column`, gap: 2 },
            children: [
              (0, $.jsxs)(a, {
                sx: {
                  display: `grid`,
                  gridTemplateColumns: `2fr 1fr 1fr`,
                  gap: 2,
                },
                children: [
                  (0, $.jsxs)(D, {
                    select: !0,
                    size: `small`,
                    label: `Employé`,
                    value: empNew,
                    onChange: (e2) => setEmpNew(e2.target.value),
                    sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                    children: H.map((em) =>
                      (0, $.jsx)(
                        s,
                        {
                          value: em.id,
                          children: B(em) + ` — ` + (em.departement || `—`),
                        },
                        em.id,
                      ),
                    ),
                  }),
                  (0, $.jsxs)(D, {
                    select: !0,
                    size: `small`,
                    label: `Année`,
                    value: anNew,
                    onChange: (e2) => setAnNew(parseInt(e2.target.value, 10)),
                    sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                    children: [ptCur.an - 1, ptCur.an, ptCur.an + 1].map((y2) =>
                      (0, $.jsx)(s, { value: y2, children: String(y2) }, y2),
                    ),
                  }),
                  (0, $.jsxs)(D, {
                    select: !0,
                    size: `small`,
                    label: `Semaine (n° ISO)`,
                    value: nmNew,
                    onChange: (e2) => setNmNew(parseInt(e2.target.value, 10)),
                    sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                    children: Array.from(
                      { length: 52 },
                      (x2, i2) => i2 + 1,
                    ).map((n2) =>
                      (0, $.jsx)(
                        s,
                        {
                          value: n2,
                          children:
                            `S` +
                            n2 +
                            ` — sem. du ` +
                            A(hsSemLundi(n2, anNew).toISOString().slice(0, 10)),
                        },
                        n2,
                      ),
                    ),
                  }),
                ],
              }),
              (() => {
                var datesN = ptDatesSem(nmNew, anNew);
                return (0, $.jsxs)(a, {
                  sx: {
                    display: `grid`,
                    gridTemplateColumns: `repeat(5,1fr)`,
                    gap: 1,
                  },
                  children: [0, 1, 2, 3, 4].map((j2) => {
                    var ferie = ptFER.has(datesN[j2]);
                    return (0, $.jsxs)(
                      D,
                      {
                        select: !0,
                        size: `small`,
                        label:
                          PT_JNOM[j2] +
                          ` ` +
                          (datesN[j2] || ``).slice(5) +
                          (ferie ? ` (férié)` : ``),
                        value: jNew[j2],
                        onChange: (e2) => {
                          var nj = jNew.slice();
                          nj[j2] = e2.target.value;
                          setJNew(nj);
                        },
                        sx: { "& .MuiInput-root": { fontSize: `0.78rem` } },
                        children: Object.keys(PT_JC)
                          .filter((c2) => c2 !== `V` && c2 !== `F`)
                          .map((c2) =>
                            (0, $.jsx)(
                              s,
                              { value: c2, children: PT_JC[c2].lbl },
                              c2,
                            ),
                          ),
                      },
                      j2,
                    );
                  }),
                });
              })(),
              (0, $.jsx)(D, {
                size: `small`,
                label: `Minutes de retard (total semaine — réparties sur les jours « Retard », 15 min/jour si vide)`,
                value: rtNew,
                onChange: (e2) => setRtNew(e2.target.value),
                type: `number`,
                sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
              }),
              (() => {
                var joursN = {};
                var minRest = parseInt(rtNew, 10) || 0;
                for (var j2 = 0; j2 < 5; j2++) {
                  var c = jNew[j2];
                  var dateJ = ptDatesSem(nmNew, anNew)[j2];
                  if (ptFER.has(dateJ)) joursN[j2] = `F`;
                  else if (c === `R`)
                    joursN[j2] = `R:` + (minRest > 0 ? minRest : 15);
                  else joursN[j2] = c;
                }
                var agg = ptAgg(joursN, ptFER, ptDatesSem(nmNew, anNew));
                return (0, $.jsxs)(c, {
                  severity: `info`,
                  children: [
                    `Aperçu : `,
                    (0, $.jsx)(i, {
                      component: `span`,
                      sx: { fontWeight: 800 },
                      children: agg.p + ` j présents`,
                    }),
                    ` · ` +
                      agg.a +
                      ` j absents · ` +
                      agg.rt +
                      ` min retards · heures ouvrées ≈ ` +
                      agg.p * mt.heuresJour +
                      ` h · taux `,
                    (0, $.jsx)(i, {
                      component: `span`,
                      sx: {
                        fontWeight: 800,
                        color:
                          agg.taux < mt.seuilTaux
                            ? `error.main`
                            : `success.main`,
                      },
                      children: agg.taux + ` %`,
                    }),
                    ` — le pointage sera enregistré en BOUILLON et devra être validé par le manager (art. 90 CT).`,
                  ],
                });
              })(),
            ],
          }),
          (0, $.jsxs)(m, {
            sx: { px: 3, pb: 2 },
            children: [
              (0, $.jsx)(l, {
                onClick: () => setDlgNew(!1),
                children: `Annuler`,
              }),
              (0, $.jsx)(l, {
                variant: `contained`,
                onClick: fEnregistrerSaisie,
                sx: { bgcolor: `#7e3ff2`, textTransform: `none` },
                children: `Enregistrer le pointage`,
              }),
            ],
          }),
        ],
      }),
      (0, $.jsx)(f, {
        open: dlgCell ? !0 : !1,
        onClose: () => setDlgCell(null),
        maxWidth: `xs`,
        fullWidth: !0,
        children: [
          (0, $.jsx)(h, {
            sx: { fontWeight: 800 },
            children:
              (dlgCell && dlgCell.emp ? B(dlgCell.emp) : ``) +
              ` — ` +
              (dlgCell ? PT_JNOM[dlgCell.j] : ``) +
              ` ` +
              (dlgCell && datesGr[dlgCell.j] ? A(datesGr[dlgCell.j]) : ``) +
              ` — ` +
              semGrLabel,
          }),
          (0, $.jsxs)(p, {
            sx: { display: `flex`, flexDirection: `column`, gap: 2 },
            children: [
              dlgCell && dlgCell.ferie
                ? (0, $.jsx)(c, {
                    severity: `warning`,
                    children: `Jour férié (chômé payé) — un pointage « Présent » ce jour constitue du travail férié (majoration, voir écran Heures supp.).`,
                  })
                : null,
              (0, $.jsx)(D, {
                select: !0,
                size: `small`,
                label: `Statut du jour`,
                value: cellC,
                onChange: (e2) => setCellC(e2.target.value),
                sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                children: Object.keys(PT_JC)
                  .filter((c2) => c2 !== `V`)
                  .map((c2) =>
                    (0, $.jsx)(s, { value: c2, children: PT_JC[c2].lbl }, c2),
                  ),
              }),
              cellC === `R`
                ? (0, $.jsx)(D, {
                    size: `small`,
                    label: `Minutes de retard`,
                    value: cellM,
                    onChange: (e2) => setCellM(e2.target.value),
                    type: `number`,
                    sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                  })
                : null,
            ],
          }),
          (0, $.jsxs)(m, {
            sx: { px: 3, pb: 2 },
            children: [
              (0, $.jsx)(l, {
                onClick: () => setDlgCell(null),
                children: `Annuler`,
              }),
              (0, $.jsx)(l, {
                variant: `contained`,
                onClick: fEditCell,
                sx: { bgcolor: `#7e3ff2`, textTransform: `none` },
                children: `Pointer`,
              }),
            ],
          }),
        ],
      }),
      (0, $.jsx)(f, {
        open: dlgRej ? !0 : !1,
        onClose: () => setDlgRej(null),
        maxWidth: `xs`,
        fullWidth: !0,
        children: [
          (0, $.jsx)(h, {
            sx: { fontWeight: 800 },
            children: `Rejeter le pointage`,
          }),
          (0, $.jsxs)(p, {
            sx: { display: `flex`, flexDirection: `column`, gap: 2 },
            children: [
              (0, $.jsx)(c, {
                severity: `warning`,
                children: `Le rejet renvoie la semaine au statut « Rejeté » : l'employé doit corriger et re-soumettre. Les jours restent visibles dans la grille.`,
              }),
              (0, $.jsx)(D, {
                size: `small`,
                label: `Motif du rejet (obligatoire)`,
                value: motRej,
                onChange: (e2) => setMotRej(e2.target.value),
                multiline: !0,
                minRows: 2,
                sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
              }),
            ],
          }),
          (0, $.jsxs)(m, {
            sx: { px: 3, pb: 2 },
            children: [
              (0, $.jsx)(l, {
                onClick: () => setDlgRej(null),
                children: `Annuler`,
              }),
              (0, $.jsx)(l, {
                variant: `contained`,
                color: `error`,
                onClick: fRejeter,
                sx: { textTransform: `none` },
                children: `Rejeter`,
              }),
            ],
          }),
        ],
      }),
      (0, $.jsx)(f, {
        open: dlgPar,
        onClose: () => setDlgPar(!1),
        maxWidth: `xs`,
        fullWidth: !0,
        children: [
          (0, $.jsx)(h, {
            sx: { fontWeight: 800 },
            children: `Paramètres de pointage (persistants)`,
          }),
          (0, $.jsxs)(p, {
            sx: { display: `flex`, flexDirection: `column`, gap: 2 },
            children: [
              (0, $.jsx)(D, {
                size: `small`,
                label: `Heures par jour`,
                value: pHj,
                onChange: (e2) => setPHj(e2.target.value),
                type: `number`,
                sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
              }),
              (0, $.jsx)(D, {
                size: `small`,
                label: `Jours ouvrables / semaine`,
                value: pJo,
                onChange: (e2) => setPJo(e2.target.value),
                type: `number`,
                sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
              }),
              (0, $.jsx)(D, {
                size: `small`,
                label: `Seuil d'alerte taux (%)`,
                value: pSt,
                onChange: (e2) => setPSt(e2.target.value),
                type: `number`,
                sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
              }),
              (0, $.jsx)(D, {
                size: `small`,
                label: `Alerte retards répétés (jours)`,
                value: pSr,
                onChange: (e2) => setPSr(e2.target.value),
                type: `number`,
                sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
              }),
              (0, $.jsx)(D, {
                size: `small`,
                label: `Délai validation manager (jours)`,
                value: pDv,
                onChange: (e2) => setPDv(e2.target.value),
                type: `number`,
                sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
              }),
              (0, $.jsx)(c, {
                severity: `info`,
                children: `Base légale : 40 h/semaine (art. 90 CT Cameroun), jours ouvrables lun–ven hors fériés. Les paramètres affectent les KPI, la grille et les alertes.`,
              }),
            ],
          }),
          (0, $.jsxs)(m, {
            sx: { px: 3, pb: 2 },
            children: [
              (0, $.jsx)(l, {
                onClick: () => setDlgPar(!1),
                children: `Annuler`,
              }),
              (0, $.jsx)(l, {
                variant: `contained`,
                onClick: fSavePar,
                sx: { bgcolor: `#7e3ff2`, textTransform: `none` },
                children: `Enregistrer`,
              }),
            ],
          }),
        ],
      }),
      (0, $.jsx)(f, {
        open: detail ? !0 : !1,
        onClose: () => setDetail(null),
        maxWidth: `sm`,
        fullWidth: !0,
        children: [
          (0, $.jsx)(h, {
            sx: { fontWeight: 800 },
            children: detail
              ? `Pointage — ` +
                (detail.emp ? B(detail.emp) : detail.employee_id) +
                ` · ` +
                detail.semaine
              : ``,
          }),
          (0, $.jsxs)(p, {
            sx: { display: `flex`, flexDirection: `column`, gap: 2 },
            children: [
              (0, $.jsxs)(a, {
                sx: {
                  display: `grid`,
                  gridTemplateColumns: `repeat(3,1fr)`,
                  gap: 1.5,
                },
                children: [
                  (0, $.jsxs)(ee, {
                    sx: { p: 1.5, borderRadius: 2, textAlign: `center` },
                    children: [
                      (0, $.jsx)(i, {
                        variant: `h6`,
                        fontWeight: 800,
                        children: detail ? detail.taux_presence + ` %` : ``,
                      }),
                      (0, $.jsx)(i, {
                        variant: `caption`,
                        sx: { color: `text.secondary` },
                        children: `Taux présence`,
                      }),
                    ],
                  }),
                  (0, $.jsxs)(ee, {
                    sx: { p: 1.5, borderRadius: 2, textAlign: `center` },
                    children: [
                      (0, $.jsx)(i, {
                        variant: `h6`,
                        fontWeight: 800,
                        children: detail
                          ? detail.jours_presents +
                            ` j · ` +
                            detail.jours_presents * mt.heuresJour +
                            ` h`
                          : ``,
                      }),
                      (0, $.jsx)(i, {
                        variant: `caption`,
                        sx: { color: `text.secondary` },
                        children: `Présence / heures`,
                      }),
                    ],
                  }),
                  (0, $.jsxs)(ee, {
                    sx: { p: 1.5, borderRadius: 2, textAlign: `center` },
                    children: [
                      (0, $.jsx)(i, {
                        variant: `h6`,
                        fontWeight: 800,
                        sx: {
                          color:
                            detail && detail.retards_minutes > 0
                              ? `warning.main`
                              : `success.main`,
                        },
                        children: detail ? detail.retards_minutes + ` min` : ``,
                      }),
                      (0, $.jsx)(i, {
                        variant: `caption`,
                        sx: { color: `text.secondary` },
                        children: detail
                          ? `Retards · ` + detail.nbJoursR + ` jour(s)`
                          : ``,
                      }),
                    ],
                  }),
                ],
              }),
              (0, $.jsx)(i, {
                variant: `caption`,
                fontWeight: 800,
                sx: { color: `text.secondary` },
                children: `Détail journalier`,
              }),
              (0, $.jsx)(a, {
                sx: { display: `flex`, gap: 1, flexWrap: `wrap` },
                children: detail
                  ? [0, 1, 2, 3, 4].map((j2) => {
                      var raw = String(detail.jours[j2] || `V`);
                      var c2 = raw.split(`:`)[0];
                      if (
                        detail.dates[j2] &&
                        ptFER.has(detail.dates[j2]) &&
                        c2 === `V`
                      )
                        c2 = `F`;
                      var cfg = PT_JC[c2] || PT_JC.V;
                      return (0, $.jsxs)(
                        a,
                        {
                          sx: {
                            px: 1.5,
                            py: 0.75,
                            borderRadius: 1.5,
                            border: `1px solid`,
                            borderColor: cfg.c,
                            bgcolor: cfg.bg,
                            color: cfg.c,
                            fontWeight: 800,
                            fontSize: `0.72rem`,
                          },
                          children: [
                            PT_JNOM[j2] +
                              ` ` +
                              (detail.dates[j2] || ``).slice(5) +
                              ` — ` +
                              (c2 === `R`
                                ? cfg.lbl +
                                  ` ` +
                                  (raw.split(`:`)[1] || `15`) +
                                  ` min`
                                : cfg.lbl),
                          ],
                        },
                        j2,
                      );
                    })
                  : null,
              }),
              detail && detail.motif_rejet
                ? (0, $.jsx)(c, {
                    severity: `error`,
                    children: `Motif de rejet : ` + detail.motif_rejet,
                  })
                : null,
              (0, $.jsx)(c, {
                severity: `info`,
                children:
                  `Traçabilité : ` +
                  (detail && detail.valide_par && R(detail.valide_par)
                    ? `validé par ` +
                      B(R(detail.valide_par)) +
                      ` le ` +
                      detail.valide_le
                    : `en attente de validation manager`) +
                  ` — sem. du ` +
                  (detail && detail.lundi
                    ? A(detail.lundi.toISOString().slice(0, 10))
                    : `—`),
              }),
            ],
          }),
          (0, $.jsxs)(m, {
            sx: { px: 3, pb: 2 },
            children: [
              (0, $.jsx)(l, {
                onClick: () => setDetail(null),
                children: `Fermer`,
              }),
              detail && detail.statut === `brouillon`
                ? (0, $.jsx)(l, {
                    variant: `contained`,
                    onClick: () => {
                      (fValider([detail.id]), setDetail(null));
                    },
                    sx: { bgcolor: `#7e3ff2`, textTransform: `none` },
                    children: `Valider ce pointage`,
                  })
                : null,
            ],
          }),
        ],
      }),
      (0, $.jsx)(d, {
        open: !!snack,
        autoHideDuration: 4200,
        onClose: () => setSnack(null),
        anchorOrigin: { vertical: `bottom`, horizontal: `center` },
        children: (0, $.jsx)(c, {
          severity: snack ? snack.sev : `info`,
          variant: `filled`,
          sx: { fontWeight: 600 },
          children: snack ? snack.msg : ``,
        }),
      }),
    ],
  });
}

/* ================================================================
   PLANNING V2 — Clôture mensuelle intelligente (écran 'planning')
   Sous-titre d'origine enfin honoré : génération RÉELLE depuis le
   journal de pointage (comptage jour à jour via les codes du journal,
   fériés sldFset), heures supp. rattachées par norme ISO 8601 (mois
   du jeudi, hsSemMois), workflow manager : brouillon → validation →
   clôture mensuelle (verrou, prêt paie). Historique simulé dérivé du
   pointage simulé (cohérence inter-écrans garantie : grille pointage
   ↔ planning montrent les mêmes chiffres). Store autonome
   admina_d2_planning_v2. Branchement dédié dans ie.
   ================================================================ */
var PL_LS = `admina_d2_planning_v2`;
var PL_VALID = `emp-009`;
var PL_ST = {
  brouillon: [`Brouillon`, `warning`, `outlined`],
  valide: [`Validé`, `success`, `outlined`],
  rejete: [`Rejeté`, `error`, `outlined`],
  cloture: [`Clôturé`, `info`, `filled`],
};
var PL_DEF = { seuilTaux: 80, jourLimite: 5, genAuto: 1 };
function plKey(an, mois) {
  return an + `-` + (mois < 10 ? `0` : ``) + mois;
}
function plDeKey(k) {
  var m = /^(\d{4})-(\d{2})$/.exec(String(k || ``));
  return m ? { an: parseInt(m[1], 10), mois: parseInt(m[2], 10) } : null;
}
function plMoisCourt(k) {
  var p = plDeKey(k);
  return p ? hsMoisLabel(p.mois) + ` ` + p.an : String(k || `—`);
}
function plAnAuto(rows) {
  var m = {};
  var cur = String(new Date().getFullYear());
  var best = cur,
    nb = 0;
  (rows || []).forEach((rd) => {
    var k = String(rd.mois || ``).slice(0, 4);
    if (!/^\d{4}$/.test(k)) return;
    m[k] = (m[k] || 0) + 1;
    if (m[k] > nb) ((nb = m[k]), (best = k));
  });
  if (m[cur]) best = cur;
  return best;
}
function plOuvrablesMois(an, mois, fset) {
  var d0 = new Date(Date.UTC(an, mois - 1, 1));
  var dm = new Date(Date.UTC(an, mois, 0));
  var dates = [],
    ouvr = [];
  for (var d = d0.getTime(); d <= dm.getTime(); d += 864e5) {
    var dt = new Date(d);
    var iso = dt.toISOString().slice(0, 10);
    var dow = dt.getUTCDay();
    dates.push({ iso: iso, dow: dow });
    if (dow >= 1 && dow <= 5 && !(fset && fset.has(iso))) ouvr.push(iso);
  }
  return { dates: dates, ouvr: ouvr };
}
/* Génération d'un record planning depuis le JOURNAL DE POINTAGE :
   chaque jour ouvrable PASSÉ du mois est retrouvé dans la semaine
   pointée qui le contient (codes P/R/A/M/T/F) — mêmes chiffres que la
   grille de l'écran pointage. Heures supp. : hsToutes rattachées au
   mois de leur jeudi (ISO 8601), statuts validee/payee uniquement.
   `auj` borne le comptage aux jours passés (mois en cours partiel). */
function plGenDe(pts, eid, an, mois, fset, hsRows, auj) {
  var mKey = plKey(an, mois);
  var infos = plOuvrablesMois(an, mois, fset);
  var p = 0,
    a = 0,
    rt = 0;
  var semaines = {},
    jours = {};
  var ouvr = 0;
  infos.ouvr.forEach((iso) => {
    if (!auj || iso <= auj) ouvr++;
  });
  /* Déduplication : un seed d'origine (pt1…) peut coexister avec un
     record simulé de la MÊME semaine — un seul compte (le validé
     d'abord, puis brouillon, puis rejeté). */
  var PL_PRIO = { valide: 0, brouillon: 1, rejete: 2 };
  var bySemRec = {};
  (pts || []).forEach((r) => {
    if (!r.semaine || !hsSemInfo(r.semaine)) return;
    var cur = bySemRec[r.semaine];
    if (!cur) {
      bySemRec[r.semaine] = r;
      return;
    }
    var pr = (x) => (PL_PRIO[x.statut] != null ? PL_PRIO[x.statut] : 3);
    if (pr(r) < pr(cur)) bySemRec[r.semaine] = r;
  });
  Object.keys(bySemRec).forEach((sk) => {
    var r = bySemRec[sk];
    var si = hsSemInfo(r.semaine);
    var dates = ptDatesSem(si.num, si.an);
    var lundi = hsSemLundi(si.num, si.an);
    var jde = ptJoursDe(r, fset);
    dates.forEach((dISO, j) => {
      if (dISO.slice(0, 7) !== mKey) return;
      if (auj && dISO > auj) return;
      var raw = String(jde[j] || `V`);
      var c = raw.split(`:`)[0];
      var mn = parseInt(raw.split(`:`)[1] || `0`, 10) || 0;
      if (fset.has(dISO) && c === `V`) c = `F`;
      if (c === `V`) return;
      if (!semaines[sk])
        semaines[sk] = {
          p: 0,
          a: 0,
          rt: 0,
          statut: r.statut,
          lundi: lundi.toISOString().slice(0, 10),
        };
      if (c === `P` || c === `M` || c === `T`) {
        p++;
        semaines[sk].p++;
      } else if (c === `A`) {
        a++;
        semaines[sk].a++;
      } else if (c === `R`) {
        p++;
        rt += mn;
        semaines[sk].p++;
        semaines[sk].rt += mn;
      }
      jours[dISO] = { c: c, mn: mn };
    });
  });
  var hs = 0;
  (hsRows || []).forEach((h) => {
    if (h.employee_id !== eid) return;
    if (h.statut === `rejetee` || h.statut === `en_attente`) return;
    var si = hsSemInfo(h.semaine);
    if (si && String(si.an) === String(an) && hsSemMois(si.num, si.an) === mois)
      hs += h.heures_supp || 0;
  });
  var taux = ouvr > 0 ? Math.min(100, Math.round((100 * p) / ouvr)) : 100;
  return {
    ouvr: ouvr,
    p: p,
    a: a,
    rt: rt,
    hs: hs,
    taux: taux,
    semaines: semaines,
    jours: jours,
    vide: p + a === 0 && Object.keys(semaines).length === 0 ? 1 : 0,
  };
}
/* Génération / recalcul d'un mois complet depuis le pointage.
   Protection manager : les lignes validées ou clôturées ne sont
   JAMAIS modifiées par une re-génération. Retourne les compteurs. */
function plGenApplique(st, an, mois) {
  var fset = sldFset();
  var hsRows = hsToutes();
  var pts = ptStore().records;
  var ids = {};
  (st.records || []).forEach((r) => (ids[r.employee_id] = 1));
  pts.forEach((r) => (ids[r.employee_id] = 1));
  var emps = Object.keys(ids).sort();
  var mKey = plKey(an, mois);
  var today = new Date().toISOString().slice(0, 10);
  var cree = 0,
    recalc = 0;
  emps.forEach((eid) => {
    var rec = (st.records || []).find(
      (r) => r.employee_id === eid && r.mois === mKey,
    );
    var g = plGenDe(
      pts.filter((r) => r.employee_id === eid),
      eid,
      an,
      mois,
      fset,
      hsRows,
      today,
    );
    if (!rec) {
      rec = {
        id: `pl-` + eid + `-` + mKey,
        employee_id: eid,
        mois: mKey,
        statut: `brouillon`,
        valide_par: null,
        valide_le: null,
        motif_rejet: null,
        cloture_par: null,
        cloture_le: null,
      };
      st.records.push(rec);
      cree++;
    } else if (rec.statut !== `brouillon` && rec.statut !== `rejete`) return;
    else recalc++;
    rec.jours_ouvrables = g.ouvr;
    rec.jours_presents = g.p;
    rec.jours_absents = g.a;
    rec.retards_minutes = g.rt;
    rec.heures_supp = g.hs;
    rec.taux_presence = g.taux;
    rec.semaines = g.semaines;
    rec.jours = g.jours;
    rec.vide = g.vide;
    rec.genere_le = today;
    rec.genere_de = `pointage`;
  });
  return { cree: cree, recalc: recalc, emps: emps.length };
}
/* Seed d'origine (pl1–pl3, 2025-09) conservé pour la continuité des
   données — valeurs recalculées depuis le pointage pour la cohérence. */
function plSeed() {
  return [
    {
      id: `pl1`,
      employee_id: `emp-001`,
      mois: `2025-09`,
      statut: `valide`,
      valide_par: PL_VALID,
      valide_le: `2025-09-15`,
      motif_rejet: null,
    },
    {
      id: `pl2`,
      employee_id: `emp-003`,
      mois: `2025-09`,
      statut: `brouillon`,
      valide_par: null,
      valide_le: null,
      motif_rejet: null,
    },
    {
      id: `pl3`,
      employee_id: `emp-014`,
      mois: `2025-09`,
      statut: `brouillon`,
      valide_par: null,
      valide_le: null,
      motif_rejet: null,
    },
  ];
}
/* Historique simulé DÉRIVÉ du pointage simulé (ptSim) : mêmes codes
   jour, mêmes statuts de semaines → cohérence pointage ↔ planning. */
var PL_SIM_CACHE = null;
function plSim() {
  if (PL_SIM_CACHE) return PL_SIM_CACHE;
  var fset = sldFset();
  var pts = ptSim();
  var hsRows = hsToutes();
  var now = new Date();
  var curAn = now.getFullYear(),
    curMois = now.getMonth() + 1;
  var byEmp = {};
  pts.forEach((r) => {
    (byEmp[r.employee_id] = byEmp[r.employee_id] || []).push(r);
  });
  var emps = Object.keys(byEmp).sort();
  var out = [];
  var auj = new Date().toISOString().slice(0, 10);
  for (var an = 2025; an <= curAn; an++) {
    var maxM = an === curAn ? curMois : 12;
    for (var mo = 1; mo <= maxM; mo++) {
      var mKey = plKey(an, mo);
      emps.forEach((eid) => {
        var g = plGenDe(byEmp[eid] || [], eid, an, mo, fset, hsRows, auj);
        var nSem = Object.keys(g.semaines).length;
        var nValid = 0,
          nRej = 0;
        Object.keys(g.semaines).forEach((k) => {
          var s2 = g.semaines[k].statut;
          if (s2 === `valide`) nValid++;
          else if (s2 === `rejete`) nRej++;
        });
        var isPast = an < curAn || (an === curAn && mo < curMois);
        var statut;
        if (g.vide) statut = `brouillon`;
        else if (!isPast) statut = `brouillon`;
        else if (nRej > nValid) statut = `rejete`;
        else if (nValid === nSem && nSem > 0) statut = `cloture`;
        else statut = `valide`;
        var fin = new Date(Date.UTC(an, mo, 0)).toISOString().slice(0, 10);
        out.push({
          id: `pl-sim-` + eid + `-` + mKey,
          employee_id: eid,
          mois: mKey,
          jours_ouvrables: g.ouvr,
          jours_presents: g.p,
          jours_absents: g.a,
          retards_minutes: g.rt,
          heures_supp: g.hs,
          taux_presence: g.taux,
          statut: statut,
          valide_par:
            statut === `valide` || statut === `cloture` ? PL_VALID : null,
          valide_le:
            statut === `valide` || statut === `cloture` ? fin : null,
          motif_rejet:
            statut === `rejete`
              ? `Semaines rejetées dans le journal de pointage — correction attendue avant clôture.`
              : null,
          cloture_par: statut === `cloture` ? PL_VALID : null,
          cloture_le: statut === `cloture` ? fin : null,
          genere_le: auj < fin ? auj : fin,
          genere_de: `pointage`,
          vide: g.vide,
          semaines: g.semaines,
          jours: g.jours,
        });
      });
    }
  }
  var seed = plSeed();
  PL_SIM_CACHE = out.filter(
    (r) =>
      !seed.some((s2) => s2.employee_id === r.employee_id && s2.mois === r.mois),
  );
  return PL_SIM_CACHE;
}
function plSeedRegen() {
  var fset = sldFset();
  var hsRows = hsToutes();
  var pts = ptStore().records;
  var today = new Date().toISOString().slice(0, 10);
  return plSeed().map((s2) => {
    var g = plGenDe(
      pts.filter((r) => r.employee_id === s2.employee_id),
      s2.employee_id,
      2025,
      9,
      fset,
      hsRows,
      today,
    );
    return Object.assign({}, s2, {
      jours_ouvrables: g.ouvr,
      jours_presents: g.p,
      jours_absents: g.a,
      retards_minutes: g.rt,
      heures_supp: g.hs,
      taux_presence: g.taux,
      semaines: g.semaines,
      jours: g.jours,
      vide: g.vide,
      genere_le: today,
      genere_de: `pointage`,
      cloture_par: null,
      cloture_le: null,
    });
  });
}
function plStore() {
  try {
    var raw = localStorage.getItem(PL_LS);
    if (raw) {
      var st = JSON.parse(raw);
      if (st && st.records && st.records.length) return st;
    }
  } catch (err) {}
  return { v: 1, records: plSeedRegen().concat(plSim()), meta: {} };
}
function plSave(st) {
  try {
    localStorage.setItem(PL_LS, JSON.stringify(st));
  } catch (err) {}
}
function plMeta(st) {
  var m = (st && st.meta) || {};
  return Object.assign({}, PL_DEF, m);
}
/* Génération auto du mois courant à l'ouverture (une seule fois par
   session, matérialise le « génération auto depuis pointage »). */
var PL_AUTO_DONE = !1;
function plAutoGen() {
  if (PL_AUTO_DONE) return !1;
  PL_AUTO_DONE = !0;
  var mt = plMeta(plStore());
  if (!mt.genAuto) return !1;
  var now = new Date();
  var key = plKey(now.getFullYear(), now.getMonth() + 1);
  var st = plStore();
  if (st.records.some((r) => r.mois === key)) return !1;
  plGenApplique(st, now.getFullYear(), now.getMonth() + 1);
  plSave(st);
  return !0;
}
function PlanningV2() {
  var plFER = sldFset(),
    plAuj = new Date().toISOString().slice(0, 10),
    nowAn = new Date().getFullYear(),
    nowMois = new Date().getMonth() + 1;
  var stTick = (0, Q.useState)(0),
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
    stAn = (0, Q.useState)(() => plAnAuto(plStore().records)),
    an = stAn[0],
    setAn = stAn[1],
    stMoisF = (0, Q.useState)(`tous`),
    moisF = stMoisF[0],
    setMoisF = stMoisF[1],
    stTri = (0, Q.useState)({ key: `mois`, dir: `desc` }),
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
    stNew = (0, Q.useState)(!1),
    dlgNew = stNew[0],
    setDlgNew = stNew[1],
    stGenAn = (0, Q.useState)(() => String(new Date().getFullYear())),
    genAn = stGenAn[0],
    setGenAn = stGenAn[1],
    stGenMois = (0, Q.useState)(() => String(new Date().getMonth() + 1)),
    genMois = stGenMois[0],
    setGenMois = stGenMois[1],
    stPar = (0, Q.useState)(!1),
    dlgPar = stPar[0],
    setDlgPar = stPar[1],
    stSel = (0, Q.useState)({}),
    sel = stSel[0],
    setSel = stSel[1],
    stRej = (0, Q.useState)(null),
    dlgRej = stRej[0],
    setDlgRej = stRej[1],
    stMotR = (0, Q.useState)(``),
    motRej = stMotR[0],
    setMotRej = stMotR[1],
    stCh = (0, Q.useState)(0),
    chOpen = stCh[0],
    setCh = stCh[1],
    stPq = (0, Q.useState)(``),
    pSt = stPq[0],
    setPSt = stPq[1],
    stPa = (0, Q.useState)(``),
    pDl = stPa[0],
    setPDl = stPa[1],
    stPg = (0, Q.useState)(`1`),
    pGa = stPg[0],
    setPGa = stPg[1];
  var depts = (0, Q.useMemo)(() => {
    var s2 = new Set();
    H.forEach((e2) => e2.departement && s2.add(e2.departement));
    return Array.from(s2).sort();
  }, []);
  var mt = (0, Q.useMemo)(() => plMeta(plStore()), [tick]);
  var ALL = (0, Q.useMemo)(() => {
    plAutoGen();
    return plStore().records.map((r) => {
      var k = plDeKey(r.mois);
      var emp = R(r.employee_id);
      var isPast = k ? k.an < nowAn || (k.an === nowAn && k.mois < nowMois) : !1;
      var lim = new Date(
        Date.UTC(k ? k.an : nowAn, k ? k.mois : nowMois, mt.jourLimite),
      )
        .toISOString()
        .slice(0, 10);
      return Object.assign({}, r, {
        emp: emp,
        an: k ? k.an : 0,
        moisNum: k ? k.mois : 0,
        mIdx: k ? k.an * 12 + (k.mois - 1) : 0,
        isPast: isPast,
        tauxBas: !r.vide && (r.taux_presence || 0) < mt.seuilTaux,
        aArbitrer:
          isPast &&
          (r.statut === `brouillon` || r.statut === `rejete`) &&
          plAuj > lim,
        nbSem: r.semaines ? Object.keys(r.semaines).length : 0,
      });
    });
  }, [tick]);
  var allAn = (0, Q.useMemo)(
    () => ALL.filter((r) => String(r.an) === String(an)),
    [ALL, an],
  );
  var moisList = (0, Q.useMemo)(() => {
    var set = {};
    allAn.forEach((r) => (set[r.mois] = 1));
    return Object.keys(set).sort().reverse();
  }, [allAn]);
  var srt = (0, Q.useMemo)(() => {
    var out = allAn.filter((r) => {
      var emp = r.emp ? B(r.emp).toLowerCase() : ``;
      if (rech) {
        var q2 = rech.toLowerCase();
        if (
          !emp.includes(q2) &&
          !String(r.mois).toLowerCase().includes(q2) &&
          !((r.emp && r.emp.matricule) || ``).toLowerCase().includes(q2)
        )
          return !1;
      }
      if (dept !== `tous` && (!r.emp || r.emp.departement !== dept)) return !1;
      if (moisF !== `tous` && r.mois !== moisF) return !1;
      if (statutF === `taux_bas` && !r.tauxBas) return !1;
      else if (statutF === `a_arbitrer` && !r.aArbitrer) return !1;
      else if (statutF === `hs` && !(r.heures_supp > 0)) return !1;
      else if (
        [`valide`, `brouillon`, `rejete`, `cloture`].indexOf(statutF) >= 0 &&
        r.statut !== statutF
      )
        return !1;
      return !0;
    });
    var f = {
      mois: (r) => r.mIdx,
      emp: (r) => (r.emp ? B(r.emp) : ``),
      ouvr: (r) => r.jours_ouvrables || 0,
      presents: (r) => r.jours_presents || 0,
      absents: (r) => r.jours_absents || 0,
      retards: (r) => r.retards_minutes || 0,
      hs: (r) => r.heures_supp || 0,
      taux: (r) => r.taux_presence || 0,
      statut: (r) => r.statut,
    };
    var kk = f[tri.key] || f.mois;
    out.sort((x2, y2) => {
      var vx = kk(x2),
        vy = kk(y2);
      var c = vx < vy ? -1 : vx > vy ? 1 : 0;
      return tri.dir === `asc` ? c : -c;
    });
    return out;
  }, [allAn, rech, dept, moisF, statutF, tri]);
  var selCount = Object.keys(sel).length;
  /* — KPI : taux du dernier mois généré (Δ vs mois précédent).
     Le mois courant partiellement pointé (< 3 semaines) est écarté :
     on affiche le dernier mois complet pour un taux représentatif. — */
  var dernierMois = (0, Q.useMemo)(() => {
    var curKey = plKey(nowAn, nowMois);
    var curLines = ALL.filter((r) => r.mois === curKey && !r.vide);
    var curPartial =
      curLines.length > 0 && Math.max.apply(null, curLines.map((r) => r.nbSem || 0)) < 3;
    var cand = ALL.filter(
      (r) =>
        !r.vide &&
        r.mIdx <= nowAn * 12 + (nowMois - 1) &&
        !(curPartial && r.mois === curKey),
    );
    if (!cand.length) return null;
    var best = cand[0];
    cand.forEach((r) => {
      if (r.mIdx > best.mIdx) best = r;
    });
    return best.mois;
  }, [ALL]);
  var kpiTaux = (0, Q.useMemo)(() => {
    if (!dernierMois) return { taux: null, d: 0, n: 0 };
    var k = plDeKey(dernierMois);
    var kPrev =
      k.mois === 1 ? plKey(k.an - 1, 12) : plKey(k.an, k.mois - 1);
    function moy(mk) {
      var l2 = ALL.filter((r) => r.mois === mk && !r.vide);
      return l2.length
        ? Math.round(l2.reduce((s2, r) => s2 + (r.taux_presence || 0), 0) / l2.length)
        : null;
    }
    var t = moy(dernierMois),
      tp = moy(kPrev);
    return {
      taux: t,
      d: tp == null || t == null ? 0 : t - tp,
      n: ALL.filter((r) => r.mois === dernierMois && !r.vide).length,
    };
  }, [ALL, dernierMois]);
  var kpiAtt = (0, Q.useMemo)(() => {
    var l2 = ALL.filter((r) => r.statut === `brouillon` || r.statut === `rejete`);
    return {
      n: l2.length,
      enRetard: l2.filter((r) => r.aArbitrer).length,
    };
  }, [ALL]);
  var kpiHs = (0, Q.useMemo)(() => {
    var l2 = allAn.filter((r) => r.heures_supp > 0);
    return { h: l2.reduce((s2, r) => s2 + r.heures_supp, 0), n: l2.length };
  }, [allAn]);
  var kpiCl = (0, Q.useMemo)(() => {
    return {
      n: allAn.filter((r) => r.statut === `cloture`).length,
      t: allAn.length,
    };
  }, [allAn]);
  var bandAlert = (0, Q.useMemo)(() => {
    var nonClot = ALL.filter(
      (r) => r.isPast && r.statut !== `cloture` && !r.vide,
    );
    var prets = nonClot.filter((r) => r.statut === `valide`).length;
    var msgs = [];
    if (kpiAtt.enRetard)
      msgs.push(
        kpiAtt.enRetard +
          ` brouillon(s)/rejeté(s) au-delà du jour limite (J+` +
          mt.jourLimite +
          `)`,
      );
    if (nonClot.length)
      msgs.push(
        nonClot.length +
          ` mois antérieur(s) non clôturé(s)` +
          (prets ? ` — ` + prets + ` prêt(s) à clôturer` : ``),
      );
    return msgs.join(` · `);
  }, [ALL, kpiAtt, mt]);
  /* — Pilotage : séries 12 mois, top/flop, départements — */
  var pilMois = (0, Q.useMemo)(() => {
    var byM = {};
    ALL.forEach((r) => {
      if (r.vide) return;
      var cur = byM[r.mIdx];
      if (!cur)
        cur = byM[r.mIdx] = {
          an: r.an,
          mois: r.moisNum,
          taux: 0,
          n: 0,
          hs: 0,
        };
      cur.taux += r.taux_presence || 0;
      cur.n++;
      cur.hs += r.heures_supp || 0;
    });
    var keys = Object.keys(byM)
      .map(Number)
      .sort((x2, y2) => x2 - y2)
      .slice(-12);
    return keys.map((k2) => {
      var c2 = byM[k2];
      return {
        key: plKey(c2.an, c2.mois),
        lbl: hsMoisLabel(c2.mois),
        taux: Math.round(c2.taux / c2.n),
        hs: c2.hs,
      };
    });
  }, [ALL]);
  var pilHsMax = Math.max(1, pilMois.reduce((s2, v2) => Math.max(s2, v2.hs), 0));
  var topMois = (0, Q.useMemo)(() => {
    if (!dernierMois) return [];
    return ALL.filter((r) => r.mois === dernierMois && !r.vide).sort(
      (x2, y2) => y2.taux_presence - x2.taux_presence,
    );
  }, [ALL, dernierMois]);
  var pilDept = (0, Q.useMemo)(() => {
    var m = {};
    allAn
      .filter((r) => !r.vide)
      .forEach((r) => {
        var d2 = r.emp && r.emp.departement ? r.emp.departement : `—`;
        var c2 = (m[d2] = m[d2] || { dept: d2, taux: 0, n: 0, hs: 0 });
        c2.taux += r.taux_presence || 0;
        c2.n++;
        c2.hs += r.heures_supp || 0;
      });
    return Object.values(m).sort((x2, y2) => y2.taux / y2.n - x2.taux / x2.n);
  }, [allAn]);
  /* — Handlers workflow : validation → clôture → réouverture — */
  var fTri = (key) => {
    setTri((t) =>
      t.key === key
        ? { key: key, dir: t.dir === `asc` ? `desc` : `asc` }
        : { key: key, dir: `desc` },
    );
  };
  var fToggle = (rw) => {
    setSel((s2) => {
      var n2 = Object.assign({}, s2);
      if (n2[rw.id]) delete n2[rw.id];
      else n2[rw.id] = 1;
      return n2;
    });
  };
  var fValider = (ids) => {
    var st = plStore();
    var today = plAuj;
    var n2 = 0;
    ids.forEach((id) => {
      var rec = st.records.find((r) => r.id === id);
      if (!rec) return;
      rec.statut = `valide`;
      rec.valide_par = PL_VALID;
      rec.valide_le = today;
      rec.motif_rejet = null;
      n2++;
    });
    plSave(st);
    setSel({});
    setTick(tick + 1);
    setSnack({
      msg: n2 + ` mois validé(s) — clôture possible (prêt paie).`,
      sev: `success`,
    });
  };
  var fCloturer = (ids) => {
    var st = plStore();
    var today = plAuj;
    var n2 = 0;
    ids.forEach((id) => {
      var rec = st.records.find((r) => r.id === id);
      if (!rec || rec.statut !== `valide`) return;
      rec.statut = `cloture`;
      rec.cloture_par = PL_VALID;
      rec.cloture_le = today;
      n2++;
    });
    plSave(st);
    setSel({});
    setTick(tick + 1);
    setSnack({
      msg: n2 +
        ` mois clôturé(s) — verrouillé(s) pour la paie (aucune modification possible).`,
      sev: `success`,
    });
  };
  var fReOuvrir = (rw) => {
    var st = plStore();
    var rec = st.records.find((r) => r.id === rw.id);
    if (!rec) return;
    var from = rec.statut;
    rec.statut = `brouillon`;
    rec.valide_par = null;
    rec.valide_le = null;
    rec.cloture_par = null;
    rec.cloture_le = null;
    plSave(st);
    setTick(tick + 1);
    setSnack({
      msg:
        (from === `cloture`
          ? `Mois clôturé rouvert — revalidation manager requise. `
          : `Mois validé rouvert — correction possible. `) +
        `Les valeurs seront recalculées à la prochaine génération.`,
      sev: `warning`,
    });
  };
  var fConfRejeter = () => {
    var m = String(motRej || ``).trim();
    if (!m) {
      setSnack({
        msg: `Le motif de rejet est obligatoire (traçabilité audit).`,
        sev: `error`,
      });
      return;
    }
    var st = plStore();
    var ids = selCount ? Object.keys(sel) : [dlgRej && dlgRej.id];
    var n2 = 0;
    ids.forEach((id) => {
      var rec = st.records.find((r) => r.id === id);
      if (!rec) return;
      rec.statut = `rejete`;
      rec.motif_rejet = m;
      rec.valide_par = null;
      rec.valide_le = null;
      n2++;
    });
    plSave(st);
    setSel({});
    setDlgRej(null);
    setMotRej(``);
    setTick(tick + 1);
    setSnack({ msg: n2 + ` mois rejeté(s) — correction attendue.`, sev: `warning` });
  };
  var fGen = () => {
    var st = plStore();
    var ga = parseInt(genAn, 10),
      gm = parseInt(genMois, 10);
    if (!ga || !gm) return;
    var res = plGenApplique(st, ga, gm);
    plSave(st);
    setDlgNew(!1);
    setAn(String(ga));
    setMoisF(plKey(ga, gm));
    setTick(tick + 1);
    setSnack({
      msg:
        `Génération depuis le pointage — ` +
        res.cree +
        ` ligne(s) créée(s), ` +
        res.recalc +
        ` recalculée(s) sur ` +
        res.emps +
        ` employé(s) (les lignes validées/clôturées restent intactes).`,
      sev: `success`,
    });
  };
  var fSavePar = () => {
    var st = plStore();
    st.meta = Object.assign({}, st.meta, {
      seuilTaux: parseInt(pSt, 10) || mt.seuilTaux,
      jourLimite: parseInt(pDl, 10) || mt.jourLimite,
      genAuto: pGa === `1` ? 1 : 0,
    });
    plSave(st);
    setDlgPar(!1);
    setTick(tick + 1);
    setSnack({
      msg: `Paramètres de planning enregistrés (persistants).`,
      sev: `success`,
    });
  };
  var plCvsRows = (rows) => {
    var out = [
      [
        `Matricule`,
        `Employé`,
        `Département`,
        `Mois`,
        `Jours ouvrables`,
        `Présents (j)`,
        `Absents (j)`,
        `Retards (min)`,
        `Heures supp.`,
        `Taux présence (%)`,
        `Statut`,
        `Généré le`,
        `Validé par`,
        `Validé le`,
        `Clôturé par`,
        `Clôturé le`,
        `Motif rejet`,
      ],
    ];
    rows.forEach((r) => {
      out.push(
        [
          (r.emp && r.emp.matricule) || `—`,
          r.emp ? B(r.emp) : r.employee_id,
          (r.emp && r.emp.departement) || `—`,
          r.mois,
          r.jours_ouvrables,
          r.jours_presents,
          r.jours_absents,
          r.retards_minutes || 0,
          r.heures_supp || 0,
          r.taux_presence,
          (PL_ST[r.statut] || [r.statut])[0],
          r.genere_le || `—`,
          r.valide_par && R(r.valide_par) ? B(R(r.valide_par)) : `—`,
          r.valide_le || `—`,
          r.cloture_par && R(r.cloture_par) ? B(R(r.cloture_par)) : `—`,
          r.cloture_le || `—`,
          r.motif_rejet || ``,
        ].map((x2) =>
          String(x2 == null ? `` : x2)
            .replace(/;/g, `,`)
            .replace(/\n/g, ` `),
        ),
      );
    });
    return out;
  };
  var fExport = () => {
    var rows = srt;
    if (!rows.length) {
      setSnack({ msg: `Aucune ligne à exporter (vérifiez les filtres).`, sev: `warning` });
      return;
    }
    var csv = plCvsRows(rows)
      .map((l2) => l2.join(`;`))
      .join(`\n`);
    var blob = new Blob([`\ufeff` + csv], { type: `text/csv;charset=utf-8` });
    var a2 = document.createElement(`a`);
    a2.href = URL.createObjectURL(blob);
    a2.download = `planning_mensuel_` + an + `.csv`;
    a2.click();
    URL.revokeObjectURL(a2.href);
    setSnack({ msg: `Export CSV — ` + rows.length + ` ligne(s).`, sev: `success` });
  };
  var fExportPaie = () => {
    var rows = allAn.filter(
      (r) => (r.statut === `cloture` || r.statut === `valide`) && !r.vide,
    );
    if (!rows.length) {
      setSnack({
        msg: `Aucun mois validé ou clôturé à exporter pour l'exercice ` + an + `.`,
        sev: `warning`,
      });
      return;
    }
    var csv = plCvsRows(rows)
      .map((l2) => l2.join(`;`))
      .join(`\n`);
    var blob = new Blob([`\ufeff` + csv], { type: `text/csv;charset=utf-8` });
    var a2 = document.createElement(`a`);
    a2.href = URL.createObjectURL(blob);
    a2.download = `planning_pret_paie_` + an + `.csv`;
    a2.click();
    URL.revokeObjectURL(a2.href);
    setSnack({
      msg: rows.length + ` mois prêt(s) paie exportés (validés + clôturés).`,
      sev: `success`,
    });
  };
  var plChip = (statut) =>
    (0, $.jsx)(T, {
      label: (PL_ST[statut] || [statut])[0],
      size: `small`,
      color: (PL_ST[statut] || [statut, `default`])[1],
      variant: (PL_ST[statut] || [statut, `outlined`])[2],
      sx: { fontWeight: 700, fontSize: `0.68rem` },
    });
  var fTh = (label, key, align) =>
    (0, $.jsx)(
      v,
      {
        align: align || `left`,
        sx: {
          fontWeight: 700,
          whiteSpace: `nowrap`,
          bgcolor: `background.default`,
        },
        children: key
          ? (0, $.jsxs)(a, {
              sx: {
                display: `inline-flex`,
                alignItems: `center`,
                gap: 0.5,
                cursor: `pointer`,
                userSelect: `none`,
                "&:hover": { color: `primary.main` },
              },
              onClick: () => fTri(key),
              children: [
                label,
                tri.key === key
                  ? (0, $.jsx)(tri.dir === `asc` ? AU : AD, {
                      sx: { fontSize: 15, color: `primary.main` },
                    })
                  : (0, $.jsx)(a, { sx: { width: 15 } }),
              ],
            })
          : label,
      },
    );  /* — Rendu principal — */
  return (0, $.jsxs)(o, {
    spacing: 2.5,
    sx: { width: `100%`, maxWidth: `100%`, minWidth: 0 },
    children: [
      (0, $.jsx)(J, {
        title: `Planning mensuel — Génération depuis pointage, validation manager & clôture`,
        subtitle:
          `Exercice ` +
          an +
          ` · ` +
          allAn.length +
          ` mois planifié(s) · Journal de pointage → agrégation mensuelle → validation manager → clôture OBLIGATOIRE avant paie`,
        action: (0, $.jsxs)(o, {
          direction: `row`,
          spacing: 1,
          children: [
            (0, $.jsx)(l, {
              variant: `outlined`,
              size: `small`,
              startIcon: (0, $.jsx)(RF, {}),
              onClick: () => {
                (setTick(tick + 1),
                  setSnack({
                    msg: `Données recalculées — seed + historique + planning local.`,
                    sev: `success`,
                  }));
              },
              sx: { textTransform: `none`, fontSize: `0.72rem` },
              children: `Recalculer`,
            }),
            (0, $.jsx)(l, {
              variant: `outlined`,
              size: `small`,
              startIcon: (0, $.jsx)(CT, {}),
              onClick: () => {
                (setGenAn(String(new Date().getFullYear())),
                  setGenMois(
                    String(
                      dernierMois
                        ? plDeKey(dernierMois).mois
                        : new Date().getMonth() + 1,
                    ),
                  ),
                  setDlgNew(!0));
              },
              sx: {
                textTransform: `none`,
                fontSize: `0.72rem`,
                borderColor: `#7e3ff2`,
                color: `#7e3ff2`,
              },
              children: `Générer depuis pointage`,
            }),
            (0, $.jsx)(l, {
              variant: `outlined`,
              size: `small`,
              startIcon: (0, $.jsx)(TUNE, {}),
              onClick: () => {
                (setPSt(String(mt.seuilTaux)),
                  setPDl(String(mt.jourLimite)),
                  setPGa(mt.genAuto ? `1` : `0`),
                  setDlgPar(!0));
              },
              sx: { textTransform: `none`, fontSize: `0.72rem` },
              children: `Paramètres`,
            }),
            (0, $.jsx)(l, {
              variant: `outlined`,
              size: `small`,
              startIcon: (0, $.jsx)(S, {}),
              onClick: fExport,
              sx: { textTransform: `none`, fontSize: `0.72rem` },
              children: `Export CSV`,
            }),
          ],
        }),
      }),
      bandAlert
        ? (0, $.jsxs)(c, {
            severity: `warning`,
            icon: (0, $.jsx)(w, {}),
            sx: { mb: 0, fontWeight: 600 },
            children: [
              bandAlert + ` `,
              (0, $.jsx)(l, {
                size: `small`,
                variant: `outlined`,
                onClick: () => {
                  (setStatutF(`a_arbitrer`), setPage(0));
                },
                sx: { textTransform: `none`, fontSize: `0.7rem`, ml: 1 },
                children: `Traiter`,
              }),
            ],
          })
        : null,
      (0, $.jsxs)(a, {
        sx: {
          display: `grid`,
          gridTemplateColumns: { xs: `1fr 1fr`, md: `repeat(4,1fr)` },
          gap: 1.5,
        },
        children: [
          (0, $.jsx)(AbsKpi, {
            ic: CT,
            grad: moisF === dernierMois && dernierMois != null,
            actif: moisF === dernierMois && dernierMois != null,
            couleur:
              kpiTaux.taux != null && kpiTaux.taux < mt.seuilTaux
                ? `error.main`
                : `success.main`,
            onClic: () => {
              (setMoisF(dernierMois || `tous`),
                setPage(0),
                setSnack({
                  msg:
                    dernierMois
                      ? `Zoom sur le dernier mois généré : ` +
                        plMoisCourt(dernierMois)
                      : `Aucun mois généré`,
                  sev: `info`,
                }));
            },
            valeur: kpiTaux.taux == null ? `—` : kpiTaux.taux + ` %`,
            label: `Taux de présence — dernier mois généré`,
            sub:
              dernierMois
                ? plMoisCourt(dernierMois) +
                  ` · ` +
                  (kpiTaux.d > 0
                    ? `▲ +`
                    : kpiTaux.d < 0
                      ? `▼ `
                      : `= `) +
                  Math.abs(kpiTaux.d) +
                  ` pts vs mois précédent`
                : `Générez le premier mois`,
          }),
          (0, $.jsx)(AbsKpi, {
            ic: HEA,
            grad: !1,
            actif: statutF === `brouillon` || statutF === `rejete`,
            couleur: kpiAtt.enRetard ? `error.main` : `warning.main`,
            onClic: () => {
              (setStatutF(
                statutF === `brouillon` || statutF === `rejete`
                  ? `tous`
                  : `brouillon`,
              ),
                setPage(0));
            },
            valeur: String(kpiAtt.n),
            label: `Brouillons / rejetés à traiter`,
            sub:
              kpiAtt.enRetard
                ? kpiAtt.enRetard + ` au-delà du jour limite (J+` + mt.jourLimite + `)`
                : `Validation manager en attente`,
          }),
          (0, $.jsx)(AbsKpi, {
            ic: PYC,
            grad: !1,
            actif: chOpen === 1,
            couleur: `info.main`,
            onClic: () => setCh(chOpen ? 0 : 1),
            valeur: kpiHs.h + ` h`,
            label: `Heures supp. cumulées — exercice ` + an,
            sub:
              kpiHs.n +
              ` ligne(s) avec HS · rattachement ISO (mois du jeudi)`,
          }),
          (0, $.jsx)(AbsKpi, {
            ic: RCPT,
            grad: !1,
            actif: statutF === `cloture`,
            couleur: `success.main`,
            onClic: () => {
              (setStatutF(statutF === `cloture` ? `tous` : `cloture`),
                setPage(0));
            },
            valeur: kpiCl.n + ` / ` + kpiCl.t,
            label: `Mois clôturés — verrouillés prêt paie`,
            sub: `Clôture = validation manager complète du mois`,
          }),
        ],
      }),
      selCount > 0
        ? (0, $.jsxs)(ee, {
            sx: {
              p: 1.2,
              borderRadius: 2,
              border: `1px solid #7e3ff2`,
              bgcolor: `rgba(126,63,242,.04)`,
              display: `flex`,
              alignItems: `center`,
              gap: 1.5,
              flexWrap: `wrap`,
            },
            children: [
              (0, $.jsx)(i, {
                variant: `body2`,
                fontWeight: 700,
                children:
                  selCount +
                  ` mois sélectionné(s) — clic sur une ligne pour sélectionner/désélectionner`,
              }),
              (0, $.jsx)(l, {
                variant: `contained`,
                size: `small`,
                onClick: () => fValider(Object.keys(sel)),
                sx: {
                  textTransform: `none`,
                  fontSize: `0.75rem`,
                  bgcolor: `#7e3ff2`,
                },
                children: `Valider la sélection`,
              }),
              (0, $.jsx)(l, {
                variant: `outlined`,
                size: `small`,
                onClick: () => fCloturer(Object.keys(sel)),
                sx: { textTransform: `none`, fontSize: `0.75rem` },
                children: `Clôturer la sélection`,
              }),
              (0, $.jsx)(l, {
                size: `small`,
                onClick: () => {
                  (setDlgRej({ lot: !0 }), setMotRej(``));
                },
                sx: { textTransform: `none`, fontSize: `0.75rem`, color: `error.main` },
                children: `Rejeter…`,
              }),
              (0, $.jsx)(l, {
                size: `small`,
                onClick: () => setSel({}),
                sx: { textTransform: `none`, fontSize: `0.75rem` },
                children: `Annuler`,
              }),
            ],
          })
        : null,
      (0, $.jsx)(ee, {
        sx: { p: 1.5, borderRadius: 3 },
        children: (0, $.jsxs)(o, {
          direction: { xs: `column`, md: `row` },
          spacing: 1.2,
          sx: { alignItems: { md: `center` } },
          children: [
            (0, $.jsx)(D, {
              size: `small`,
              placeholder: `Rechercher (nom, matricule, mois…)`,
              value: rech,
              onChange: (e2) => {
                (setRech(e2.target.value), setPage(0));
              },
              sx: {
                flex: 2,
                minWidth: 0,
                "& .MuiInput-root": { fontSize: `0.8rem` },
              },
            }),
            (0, $.jsxs)(D, {
              select: !0,
              size: `small`,
              label: `Département`,
              value: dept,
              onChange: (e2) => {
                (setDept(e2.target.value), setPage(0));
              },
              sx: {
                minWidth: 150,
                "& .MuiInput-root": { fontSize: `0.78rem` },
              },
              children: [
                (0, $.jsx)(s, { value: `tous`, children: `Tous départements` }),
                depts.map((d2) =>
                  (0, $.jsx)(s, { value: d2, children: d2 }, d2),
                ),
              ],
            }),
            (0, $.jsxs)(D, {
              select: !0,
              size: `small`,
              label: `Statut / alerte`,
              value: statutF,
              onChange: (e2) => {
                (setStatutF(e2.target.value), setPage(0));
              },
              sx: {
                minWidth: 175,
                "& .MuiInput-root": { fontSize: `0.78rem` },
              },
              children: [
                (0, $.jsx)(s, { value: `tous`, children: `Tous statuts` }),
                (0, $.jsx)(s, {
                  value: `brouillon`,
                  children: `Brouillons à valider`,
                }),
                (0, $.jsx)(s, { value: `valide`, children: `Validés` }),
                (0, $.jsx)(s, { value: `rejete`, children: `Rejetés` }),
                (0, $.jsx)(s, { value: `cloture`, children: `Clôturés` }),
                (0, $.jsx)(s, {
                  value: `a_arbitrer`,
                  children: `⚠ Au-delà du jour limite`,
                }),
                (0, $.jsx)(s, {
                  value: `taux_bas`,
                  children: `⚠ Taux < seuil`,
                }),
                (0, $.jsx)(s, { value: `hs`, children: `⚠ Avec heures supp.` }),
              ],
            }),
            (0, $.jsxs)(D, {
              select: !0,
              size: `small`,
              label: `Mois`,
              value: moisF,
              onChange: (e2) => {
                (setMoisF(e2.target.value), setPage(0));
              },
              sx: {
                minWidth: 140,
                "& .MuiInput-root": { fontSize: `0.78rem` },
              },
              children: [
                (0, $.jsx)(s, { value: `tous`, children: `Tous les mois` }),
                moisList.map((mk) =>
                  (0, $.jsx)(s, { value: mk, children: plMoisCourt(mk) }, mk),
                ),
              ],
            }),
            (0, $.jsxs)(D, {
              select: !0,
              size: `small`,
              label: `Exercice`,
              value: an,
              onChange: (e2) => {
                (setAn(e2.target.value), setMoisF(`tous`), setPage(0));
              },
              sx: {
                minWidth: 105,
                "& .MuiInput-root": { fontSize: `0.78rem` },
              },
              children: (() => {
                var set = {};
                plStore().records.forEach((r) => {
                  var k = plDeKey(r.mois);
                  if (k) set[k.an] = 1;
                });
                return Object.keys(set)
                  .sort()
                  .reverse()
                  .map((y2) => (0, $.jsx)(s, { value: y2, children: y2 }, y2));
              })(),
            }),
          ],
        }),
      }),
      (0, $.jsx)(y, {
        sx: { borderRadius: 2, border: `1px solid`, borderColor: `divider` },
        children: (0, $.jsxs)(ne, {
          size: `small`,
          stickyHeader: !0,
          sx: { "& .MuiTableCell-root": { fontSize: `0.78rem` } },
          children: [
            (0, $.jsx)(te, {
              children: (0, $.jsxs)(b, {
                sx: { bgcolor: `background.default` },
                children: [
                  fTh(`Employé`, `emp`),
                  fTh(`Mois`, `mois`),
                  fTh(`Ouvrables`, `ouvr`, `right`),
                  fTh(`Présents`, `presents`, `right`),
                  fTh(`Absents`, `absents`, `right`),
                  fTh(`Retards`, `retards`, `right`),
                  fTh(`Heures supp.`, `hs`, `right`),
                  fTh(`Taux présence`, `taux`),
                  fTh(`Statut`, `statut`),
                  (0, $.jsx)(v, {
                    align: `center`,
                    sx: { fontWeight: 700 },
                    children: `Actions`,
                  }),
                ],
              }),
            }),
            (0, $.jsxs)(_, {
              children: [
                srt.slice(page * pp, page * pp + pp).map((rw) =>
                  (0, $.jsxs)(
                    b,
                    {
                      hover: !0,
                      onClick: () => fToggle(rw),
                      sx: {
                        cursor: `pointer`,
                        bgcolor: sel[rw.id]
                          ? `rgba(126,63,242,.08)`
                          : undefined,
                      },
                      children: [
                        (0, $.jsx)(v, {
                          children: (0, $.jsxs)(a, {
                            sx: {
                              display: `flex`,
                              alignItems: `center`,
                              gap: 1.2,
                              minWidth: 0,
                            },
                            children: [
                              (0, $.jsx)(a, {
                                sx: {
                                  width: 32,
                                  height: 32,
                                  borderRadius: `50%`,
                                  bgcolor: `rgba(126,63,242,.12)`,
                                  color: `#7e3ff2`,
                                  display: `flex`,
                                  alignItems: `center`,
                                  justifyContent: `center`,
                                  fontWeight: 800,
                                  fontSize: `0.72rem`,
                                  flexShrink: 0,
                                },
                                children: rw.emp
                                  ? B(rw.emp)
                                      .split(` `)
                                      .map((w2) => w2[0])
                                      .join(``)
                                      .slice(0, 2)
                                      .toUpperCase()
                                  : `?`,
                              }),
                              (0, $.jsxs)(a, {
                                sx: { minWidth: 0 },
                                children: [
                                  (0, $.jsx)(i, {
                                    variant: `body2`,
                                    fontWeight: 700,
                                    noWrap: !0,
                                    children: rw.emp
                                      ? B(rw.emp)
                                      : rw.employee_id,
                                  }),
                                  (0, $.jsx)(i, {
                                    variant: `caption`,
                                    sx: {
                                      color: `text.secondary`,
                                      fontFamily: `monospace`,
                                    },
                                    children:
                                      (rw.emp && rw.emp.departement) || `—`,
                                  }),
                                ],
                              }),
                            ],
                          }),
                        }),
                        (0, $.jsxs)(v, {
                          children: [
                            (0, $.jsx)(T, {
                              label: plMoisCourt(rw.mois),
                              size: `small`,
                              variant: `outlined`,
                              sx: { fontWeight: 700, fontSize: `0.68rem` },
                            }),
                            rw.nbSem
                              ? (0, $.jsx)(i, {
                                  variant: `caption`,
                                  sx: {
                                    display: `block`,
                                    color: `text.secondary`,
                                  },
                                  children:
                                    rw.nbSem + ` semaine(s) pointée(s)`,
                                })
                              : (0, $.jsx)(i, {
                                  variant: `caption`,
                                  sx: {
                                    display: `block`,
                                    color: `text.disabled`,
                                  },
                                  children: `aucun pointage rattaché`,
                                }),
                          ],
                        }),
                        (0, $.jsx)(v, {
                          align: `right`,
                          children: (0, $.jsx)(i, {
                            variant: `body2`,
                            fontWeight: 700,
                            children: String(rw.jours_ouvrables || 0),
                          }),
                        }),
                        (0, $.jsx)(v, {
                          align: `right`,
                          children: (0, $.jsx)(i, {
                            variant: `body2`,
                            fontWeight: 700,
                            color: `success.main`,
                            children: String(rw.jours_presents || 0) + ` j`,
                          }),
                        }),
                        (0, $.jsx)(v, {
                          align: `right`,
                          children:
                            rw.jours_absents > 0
                              ? (0, $.jsx)(i, {
                                  variant: `body2`,
                                  fontWeight: 700,
                                  color: `error.main`,
                                  children: rw.jours_absents + ` j`,
                                })
                              : (0, $.jsx)(i, {
                                  variant: `body2`,
                                  color: `text.disabled`,
                                  children: `0`,
                                }),
                        }),
                        (0, $.jsx)(v, {
                          align: `right`,
                          children:
                            rw.retards_minutes > 0
                              ? (0, $.jsx)(i, {
                                  variant: `body2`,
                                  fontWeight: 700,
                                  color: `warning.main`,
                                  children: rw.retards_minutes + ` min`,
                                })
                              : (0, $.jsx)(i, {
                                  variant: `body2`,
                                  color: `text.disabled`,
                                  children: `0`,
                                }),
                        }),
                        (0, $.jsx)(v, {
                          align: `right`,
                          children:
                            rw.heures_supp > 0
                              ? (0, $.jsx)(i, {
                                  variant: `body2`,
                                  fontWeight: 700,
                                  color: `info.main`,
                                  children: rw.heures_supp + ` h`,
                                })
                              : (0, $.jsx)(i, {
                                  variant: `body2`,
                                  color: `text.disabled`,
                                  children: `0`,
                                }),
                        }),
                        (0, $.jsx)(v, {
                          sx: { minWidth: 130 },
                          children: rw.vide
                            ? (0, $.jsx)(i, {
                                variant: `body2`,
                                color: `text.disabled`,
                                children: `— (non pointé)`,
                              })
                            : (0, $.jsx)(X, {
                                value: rw.taux_presence || 0,
                                max: 100,
                                label: (rw.taux_presence || 0) + `%`,
                              }),
                        }),
                        (0, $.jsxs)(v, {
                          children: [
                            plChip(rw.statut),
                            rw.aArbitrer
                              ? (0, $.jsx)(i, {
                                  variant: `caption`,
                                  sx: {
                                    display: `block`,
                                    color: `warning.main`,
                                    fontWeight: 700,
                                    mt: 0.5,
                                  },
                                  children: `hors délai`,
                                })
                              : rw.statut === `cloture` && rw.cloture_le
                                ? (0, $.jsx)(i, {
                                    variant: `caption`,
                                    sx: {
                                      display: `block`,
                                      color: `text.secondary`,
                                      mt: 0.5,
                                    },
                                    children: `clôturé le ` + rw.cloture_le,
                                  })
                                : rw.statut === `valide` && rw.valide_le
                                  ? (0, $.jsx)(i, {
                                      variant: `caption`,
                                      sx: {
                                        display: `block`,
                                        color: `text.secondary`,
                                        mt: 0.5,
                                      },
                                      children: `validé le ` + rw.valide_le,
                                    })
                                  : null,
                          ],
                        }),
                        (0, $.jsx)(v, {
                          children: (0, $.jsxs)(a, {
                            sx: {
                              display: `flex`,
                              gap: 0.5,
                              alignItems: `center`,
                              flexWrap: `wrap`,
                              minWidth: 190,
                            },
                            children: [
                              (0, $.jsx)(l, {
                                size: `small`,
                                onClick: (e2) => {
                                  (e2.stopPropagation(), setDetail(rw));
                                },
                                sx: { minWidth: 0, px: 1 },
                                title: `Fiche détail du mois`,
                                children: (0, $.jsx)(C, {
                                  sx: { fontSize: 18 },
                                }),
                              }),
                              (rw.statut === `brouillon` || rw.statut === `rejete`)
                                ? (0, $.jsx)(l, {
                                    size: `small`,
                                    variant: `outlined`,
                                    onClick: (e2) => {
                                      (e2.stopPropagation(),
                                        fValider([rw.id]));
                                    },
                                    sx: {
                                      textTransform: `none`,
                                      fontSize: `0.68rem`,
                                      minWidth: 0,
                                      px: 1,
                                      color: `success.main`,
                                      borderColor: `success.main`,
                                    },
                                    children: `Valider`,
                                  })
                                : null,
                              (rw.statut === `valide`)
                                ? (0, $.jsx)(l, {
                                    size: `small`,
                                    variant: `outlined`,
                                    onClick: (e2) => {
                                      (e2.stopPropagation(),
                                        fCloturer([rw.id]));
                                    },
                                    sx: {
                                      textTransform: `none`,
                                      fontSize: `0.68rem`,
                                      minWidth: 0,
                                      px: 1,
                                      color: `info.main`,
                                      borderColor: `info.main`,
                                    },
                                    children: `Clôturer`,
                                  })
                                : null,
                              (rw.statut === `brouillon` || rw.statut === `valide` ||
                                rw.statut === `cloture`)
                                ? (0, $.jsx)(l, {
                                    size: `small`,
                                    onClick: (e2) => {
                                      (e2.stopPropagation(),
                                        setMotRej(``),
                                        setDlgRej(rw));
                                    },
                                    sx: {
                                      textTransform: `none`,
                                      fontSize: `0.68rem`,
                                      minWidth: 0,
                                      px: 1,
                                      color: `error.main`,
                                    },
                                    children: `Rejeter`,
                                  })
                                : null,
                              (rw.statut === `valide` || rw.statut === `cloture`)
                                ? (0, $.jsx)(l, {
                                    size: `small`,
                                    onClick: (e2) => {
                                      (e2.stopPropagation(), fReOuvrir(rw));
                                    },
                                    sx: {
                                      textTransform: `none`,
                                      fontSize: `0.68rem`,
                                      minWidth: 0,
                                      px: 1,
                                    },
                                    children: `Réouvrir`,
                                  })
                                : null,
                            ],
                          }),
                        }),
                      ],
                    },
                    rw.id,
                  ),
                ),
                srt.length === 0
                  ? (0, $.jsx)(b, {
                      children: (0, $.jsx)(v, {
                        colSpan: 10,
                        align: `center`,
                        sx: { py: 4, color: `text.secondary` },
                        children:
                          `Aucun mois planifié ne correspond aux filtres — utilisez « Générer depuis pointage » pour créer le premier planning.`,
                      }),
                    })
                  : null,
              ],
            }),
          ],
        }),
      }),
      (0, $.jsx)(g, {
        component: `div`,
        count: srt.length,
        page: page,
        onPageChange: (e2, v2) => setPage(v2),
        rowsPerPage: pp,
        onRowsPerPageChange: (e2) => {
          (setPp(parseInt(e2.target.value, 10)), setPage(0));
        },
        rowsPerPageOptions: [10, 20, 50],
        labelRowsPerPage: `Lignes :`,
        labelDisplayedRows: (pg2) =>
          pg2.from + `-` + pg2.to + ` sur ` + pg2.count,
        sx: { mt: -1 },
      }),
      (0, $.jsxs)(ee, {
        sx: { borderRadius: 3 },
        children: (0, $.jsxs)(u, {
          children: [
            (0, $.jsxs)(a, {
              sx: {
                display: `flex`,
                alignItems: `center`,
                gap: 1,
                mb: 1.5,
                flexWrap: `wrap`,
              },
              children: [
                (0, $.jsx)(AS2, { sx: { fontSize: 20, color: `#7e3ff2` } }),
                (0, $.jsx)(i, {
                  variant: `subtitle2`,
                  fontWeight: 800,
                  children: `Pilotage visuel — taux de présence, heures supp. & clôtures`,
                }),
                (0, $.jsx)(a, {
                  sx: {
                    ml: `auto`,
                    display: `flex`,
                    alignItems: `center`,
                    gap: 1,
                  },
                  children: [
                    (0, $.jsx)(l, {
                      variant: `outlined`,
                      size: `small`,
                      startIcon: (0, $.jsx)(PYC, {}),
                      onClick: fExportPaie,
                      sx: { textTransform: `none`, fontSize: `0.7rem` },
                      children: `Exporter les mois validés (prêt paie)`,
                    }),
                    (0, $.jsx)(l, {
                      size: `small`,
                      onClick: () => setCh(chOpen ? 0 : 1),
                      sx: {
                        textTransform: `none`,
                        fontSize: `0.72rem`,
                        minWidth: 0,
                      },
                      children: chOpen ? `Masquer` : `Afficher`,
                    }),
                  ],
                }),
              ],
            }),
            chOpen
              ? (0, $.jsxs)(a, {
                  sx: {
                    display: `grid`,
                    gridTemplateColumns: { xs: `1fr`, md: `1fr 1fr` },
                    gap: 3,
                    mt: 1.5,
                    overflowX: `auto`,
                  },
                  children: [
                    (0, $.jsxs)(a, {
                      children: [
                        (0, $.jsx)(i, {
                          variant: `caption`,
                          fontWeight: 800,
                          sx: {
                            color: `text.secondary`,
                            display: `block`,
                            mb: 1,
                          },
                          children:
                            `Évolution du taux de présence — 12 derniers mois générés (seuil ` +
                            mt.seuilTaux +
                            ` %)`,
                        }),
                        (0, $.jsx)(a, {
                          sx: {
                            display: `flex`,
                            alignItems: `flex-end`,
                            gap: 0.5,
                            height: 72,
                            maxWidth: `100%`,
                          },
                          children: pilMois.map((v2) =>
                            (0, $.jsxs)(
                              a,
                              {
                                title: plMoisCourt(v2.key) + ` : ` + v2.taux + ` %`,
                                sx: {
                                  flex: 1,
                                  display: `flex`,
                                  flexDirection: `column`,
                                  justifyContent: `flex-end`,
                                  alignItems: `center`,
                                  gap: 0.25,
                                  minWidth: 0,
                                },
                                children: [
                                  (0, $.jsx)(i, {
                                    variant: `caption`,
                                    sx: {
                                      fontSize: `0.55rem`,
                                      fontWeight: 800,
                                    },
                                    children: String(v2.taux),
                                  }),
                                  (0, $.jsx)(a, {
                                    sx: {
                                      width: `100%`,
                                      height: Math.max(
                                        3,
                                        Math.round((v2.taux / 100) * 52),
                                      ),
                                      bgcolor:
                                        v2.taux < mt.seuilTaux
                                          ? `error.main`
                                          : v2.taux < 95
                                            ? `warning.main`
                                            : `success.main`,
                                      borderRadius: `3px 3px 0 0`,
                                    },
                                  }),
                                  (0, $.jsx)(i, {
                                    variant: `caption`,
                                    sx: {
                                      fontSize: `0.5rem`,
                                      color: `text.secondary`,
                                    },
                                    children: v2.lbl,
                                  }),
                                ],
                              },
                              v2.key,
                            ),
                          ),
                        }),
                      ],
                    }),
                    (0, $.jsxs)(a, {
                      children: [
                        (0, $.jsx)(i, {
                          variant: `caption`,
                          fontWeight: 800,
                          sx: {
                            color: `text.secondary`,
                            display: `block`,
                            mb: 1,
                          },
                          children:
                            `Heures supplémentaires validées / payées — rattachement ISO (exercice ` +
                            an +
                            `)`,
                        }),
                        (0, $.jsx)(a, {
                          sx: {
                            display: `flex`,
                            alignItems: `flex-end`,
                            gap: 0.5,
                            height: 72,
                            maxWidth: `100%`,
                          },
                          children: pilMois.map((v2) =>
                            (0, $.jsxs)(
                              a,
                              {
                                title:
                                  plMoisCourt(v2.key) +
                                  ` : ` +
                                  v2.hs +
                                  ` h (validées + payées)`,
                                sx: {
                                  flex: 1,
                                  display: `flex`,
                                  flexDirection: `column`,
                                  justifyContent: `flex-end`,
                                  alignItems: `center`,
                                  gap: 0.25,
                                  minWidth: 0,
                                },
                                children: [
                                  (0, $.jsx)(i, {
                                    variant: `caption`,
                                    sx: {
                                      fontSize: `0.55rem`,
                                      fontWeight: 800,
                                    },
                                    children: String(v2.hs),
                                  }),
                                  (0, $.jsx)(a, {
                                    sx: {
                                      width: `100%`,
                                      height: Math.max(
                                        3,
                                        Math.round((v2.hs / pilHsMax) * 52),
                                      ),
                                      bgcolor: `#7e3ff2`,
                                      borderRadius: `3px 3px 0 0`,
                                    },
                                  }),
                                  (0, $.jsx)(i, {
                                    variant: `caption`,
                                    sx: {
                                      fontSize: `0.5rem`,
                                      color: `text.secondary`,
                                    },
                                    children: v2.lbl,
                                  }),
                                ],
                              },
                              v2.key,
                            ),
                          ),
                        }),
                      ],
                    }),
                    (0, $.jsxs)(a, {
                      children: [
                        (0, $.jsx)(i, {
                          variant: `caption`,
                          fontWeight: 800,
                          sx: {
                            color: `text.secondary`,
                            display: `block`,
                            mb: 1,
                          },
                          children: dernierMois
                            ? `Meilleurs taux — ` + plMoisCourt(dernierMois)
                            : `Meilleurs taux — dernier mois`,
                        }),
                        (0, $.jsx)(o, {
                          spacing: 0.5,
                          children: topMois.slice(0, 3).map((r2, i2) =>
                            (0, $.jsxs)(
                              a,
                              {
                                onClick: () => {
                                  (setRech(r2.emp ? B(r2.emp) : ``), setPage(0));
                                },
                                sx: {
                                  display: `flex`,
                                  alignItems: `center`,
                                  gap: 1,
                                  cursor: `pointer`,
                                  p: 0.5,
                                  borderRadius: 1,
                                  "&:hover": { bgcolor: `action.hover` },
                                },
                                children: [
                                  (0, $.jsx)(T, {
                                    label: `#` + (i2 + 1),
                                    size: `small`,
                                    sx: {
                                      fontWeight: 800,
                                      fontSize: `0.62rem`,
                                      bgcolor: `success.main`,
                                      color: `#fff`,
                                    },
                                  }),
                                  (0, $.jsx)(i, {
                                    variant: `body2`,
                                    fontWeight: 700,
                                    sx: { flex: 1, minWidth: 0, noWrap: !0 },
                                    children: r2.emp ? B(r2.emp) : r2.employee_id,
                                  }),
                                  (0, $.jsx)(i, {
                                    variant: `body2`,
                                    fontWeight: 800,
                                    color: `success.main`,
                                    children: (r2.taux_presence || 0) + ` %`,
                                  }),
                                ],
                              },
                              r2.id,
                            ),
                          ),
                        }),
                      ],
                    }),
                    (0, $.jsxs)(a, {
                      children: [
                        (0, $.jsx)(i, {
                          variant: `caption`,
                          fontWeight: 800,
                          sx: {
                            color: `text.secondary`,
                            display: `block`,
                            mb: 1,
                          },
                          children: dernierMois
                            ? `À surveiller (taux < ` + mt.seuilTaux + ` %) — ` + plMoisCourt(dernierMois)
                            : `À surveiller`,
                        }),
                        (0, $.jsx)(o, {
                          spacing: 0.5,
                          children: (() => {
                            var flops = topMois.filter((r2) => r2.tauxBas);
                            if (!flops.length)
                              return (0, $.jsx)(i, {
                                variant: `body2`,
                                color: `text.secondary`,
                                children: `Aucun employé sous le seuil — présence homogène.`,
                              });
                            return flops.slice(0, 3).map((r2) =>
                              (0, $.jsxs)(
                                a,
                                {
                                  onClick: () => {
                                    (setRech(r2.emp ? B(r2.emp) : ``), setPage(0));
                                  },
                                  sx: {
                                    display: `flex`,
                                    alignItems: `center`,
                                    gap: 1,
                                    cursor: `pointer`,
                                    p: 0.5,
                                    borderRadius: 1,
                                    "&:hover": { bgcolor: `action.hover` },
                                  },
                                  children: [
                                    (0, $.jsx)(w, {
                                      sx: {
                                        fontSize: 16,
                                        color: `warning.main`,
                                      },
                                    }),
                                    (0, $.jsx)(i, {
                                      variant: `body2`,
                                      fontWeight: 700,
                                      sx: { flex: 1, minWidth: 0, noWrap: !0 },
                                      children: r2.emp
                                        ? B(r2.emp)
                                        : r2.employee_id,
                                    }),
                                    (0, $.jsx)(i, {
                                      variant: `body2`,
                                      fontWeight: 800,
                                      color: `error.main`,
                                      children:
                                        (r2.taux_presence || 0) +
                                        ` % · ` +
                                        (r2.jours_absents || 0) +
                                        ` j abs.`,
                                    }),
                                  ],
                                },
                                r2.id,
                              ),
                            );
                          })(),
                        }),
                      ],
                    }),
                    (0, $.jsxs)(a, {
                      sx: { gridColumn: { md: `1 / -1` } },
                      children: [
                        (0, $.jsx)(i, {
                          variant: `caption`,
                          fontWeight: 800,
                          sx: {
                            color: `text.secondary`,
                            display: `block`,
                            mb: 1,
                          },
                          children:
                            `Départements — taux moyen ` +
                            an +
                            ` (clic pour filtrer le tableau)`,
                        }),
                        (0, $.jsx)(a, {
                          sx: {
                            display: `flex`,
                            gap: 0.75,
                            flexWrap: `wrap`,
                          },
                          children: pilDept.map((d2) =>
                            (0, $.jsx)(
                              T,
                              {
                                label:
                                  d2.dept +
                                  ` · ` +
                                  Math.round(d2.taux / d2.n) +
                                  ` % · ` +
                                  d2.hs +
                                  ` h HS`,
                                onClick: () => {
                                  (setDept(
                                    dept === d2.dept ? `tous` : d2.dept,
                                  ), setPage(0));
                                },
                                variant:
                                  dept === d2.dept ? `filled` : `outlined`,
                                color: dept === d2.dept ? `secondary` : `default`,
                                sx: {
                                  fontWeight: 700,
                                  fontSize: `0.66rem`,
                                  cursor: `pointer`,
                                },
                              },
                              d2.dept,
                            ),
                          ),
                        }),
                      ],
                    }),
                  ],
                })
              : null,
          ],
        }),
      }),
      (0, $.jsx)(f, {
        open: detail ? !0 : !1,
        onClose: () => setDetail(null),
        maxWidth: `md`,
        fullWidth: !0,
        children: [
          (0, $.jsx)(h, {
            sx: { fontWeight: 800 },
            children: detail
              ? (detail.emp ? B(detail.emp) : detail.employee_id) +
                ` — ` +
                plMoisCourt(detail.mois) +
                (detail.vide ? ` (aucun pointage rattaché)` : ``)
              : ``,
          }),
          (0, $.jsxs)(p, {
            sx: { display: `flex`, flexDirection: `column`, gap: 2 },
            children: [
              detail
                ? (0, $.jsxs)(a, {
                    sx: {
                      display: `grid`,
                      gridTemplateColumns: {
                        xs: `repeat(3,1fr)`,
                        md: `repeat(6,1fr)`,
                      },
                      gap: 1,
                    },
                    children: [
                      (0, $.jsx)(AbsTuile, {
                        label: `Ouvrables`,
                        valeur: String(detail.jours_ouvrables || 0),
                      }),
                      (0, $.jsx)(AbsTuile, {
                        label: `Présents`,
                        valeur: (detail.jours_presents || 0) + ` j`,
                        couleur: `success.main`,
                      }),
                      (0, $.jsx)(AbsTuile, {
                        label: `Absents`,
                        valeur: (detail.jours_absents || 0) + ` j`,
                        couleur: `error.main`,
                      }),
                      (0, $.jsx)(AbsTuile, {
                        label: `Retards`,
                        valeur: (detail.retards_minutes || 0) + ` min`,
                        couleur: `warning.main`,
                      }),
                      (0, $.jsx)(AbsTuile, {
                        label: `Heures supp.`,
                        valeur: (detail.heures_supp || 0) + ` h`,
                        couleur: `info.main`,
                      }),
                      (0, $.jsx)(AbsTuile, {
                        label: `Taux présence`,
                        valeur: detail.vide
                          ? `—`
                          : (detail.taux_presence || 0) + ` %`,
                        couleur: `#7e3ff2`,
                      }),
                    ],
                  })
                : null,
              detail
                ? (0, $.jsxs)(a, {
                    children: [
                      (0, $.jsx)(i, {
                        variant: `caption`,
                        fontWeight: 800,
                        sx: { color: `text.secondary`, display: `block`, mb: 1 },
                        children:
                          `Calendrier du mois reconstitué depuis le journal de pointage (P présent · R retard · A absent · M mission · T télétravail · F férié)`,
                      }),
                      (0, $.jsx)(a, {
                        sx: {
                          display: `grid`,
                          gridTemplateColumns: `repeat(7,1fr)`,
                          gap: 0.5,
                        },
                        children: (() => {
                          var k2 = plDeKey(detail.mois);
                          if (!k2) return null;
                          var infos = plOuvrablesMois(k2.an, k2.mois, plFER);
                          var off = (infos.dates[0].dow + 6) % 7;
                          var cells = [];
                          for (var z2 = 0; z2 < off; z2++)
                            cells.push(
                              (0, $.jsx)(
                                a,
                                { sx: { minHeight: 34 } },
                                `off` + z2,
                              ),
                            );
                          infos.dates.forEach((dd) => {
                            var code = detail.jours && detail.jours[dd.iso]
                              ? detail.jours[dd.iso].c
                              : plFER.has(dd.iso)
                                ? `F`
                                : dd.dow === 0 || dd.dow === 6
                                  ? `WE`
                                  : `V`;
                            var mn =
                              detail.jours && detail.jours[dd.iso]
                                ? detail.jours[dd.iso].mn
                                : 0;
                            var jc =
                              code === `WE`
                                ? {
                                    lbl: `Week-end`,
                                    c: `text.disabled`,
                                    bg: `transparent`,
                                  }
                                : PT_JC[code] || PT_JC.V;
                            cells.push(
                              (0, $.jsxs)(
                                a,
                                {
                                  title:
                                    dd.iso +
                                    ` · ` +
                                    jc.lbl +
                                    (code === `R` && mn ? ` (` + mn + ` min)` : ``),
                                  sx: {
                                    minHeight: 34,
                                    borderRadius: 1,
                                    border: `1px solid`,
                                    borderColor: `divider`,
                                    bgcolor: jc.bg || `transparent`,
                                    display: `flex`,
                                    flexDirection: `column`,
                                    alignItems: `center`,
                                    justifyContent: `center`,
                                    p: 0.25,
                                  },
                                  children: [
                                    (0, $.jsx)(i, {
                                      variant: `caption`,
                                      sx: {
                                        fontSize: `0.55rem`,
                                        color: `text.secondary`,
                                      },
                                      children: String(parseInt(dd.iso.slice(8), 10)),
                                    }),
                                    (0, $.jsx)(i, {
                                      variant: `caption`,
                                      sx: {
                                        fontSize: `0.6rem`,
                                        fontWeight: 800,
                                        color: jc.c,
                                      },
                                      children: code,
                                    }),
                                  ],
                                },
                                dd.iso,
                              ),
                            );
                          });
                          return cells;
                        })(),
                      }),
                    ],
                  })
                : null,
              detail && detail.semaines && Object.keys(detail.semaines).length
                ? (0, $.jsxs)(a, {
                    children: [
                      (0, $.jsx)(i, {
                        variant: `caption`,
                        fontWeight: 800,
                        sx: { color: `text.secondary`, display: `block`, mb: 1 },
                        children:
                          `Semaines du mois — statut de validation dans le journal de pointage`,
                      }),
                      (0, $.jsx)(a, {
                        sx: { display: `flex`, gap: 0.75, flexWrap: `wrap` },
                        children: Object.keys(detail.semaines)
                          .sort()
                          .map((sk) => {
                            var sw = detail.semaines[sk];
                            return (0, $.jsxs)(
                              a,
                              {
                                sx: {
                                  display: `flex`,
                                  alignItems: `center`,
                                  gap: 0.75,
                                  p: 0.75,
                                  borderRadius: 1.5,
                                  border: `1px solid`,
                                  borderColor: `divider`,
                                },
                                children: [
                                  (0, $.jsx)(T, {
                                    label: sk,
                                    size: `small`,
                                    variant: `outlined`,
                                    sx: {
                                      fontWeight: 800,
                                      fontSize: `0.64rem`,
                                    },
                                  }),
                                  (0, $.jsx)(i, {
                                    variant: `caption`,
                                    children:
                                      sw.p +
                                      ` j prés. · ` +
                                      sw.a +
                                      ` j abs.` +
                                      (sw.rt ? ` · ` + sw.rt + ` min retards` : ``),
                                  }),
                                  (0, $.jsx)(T, {
                                    label:
                                      sw.statut === `valide`
                                        ? `pointage validé`
                                        : sw.statut === `rejete`
                                          ? `pointage rejeté`
                                          : sw.statut === `brouillon`
                                            ? `pointage brouillon`
                                            : sw.statut,
                                    size: `small`,
                                    color:
                                      sw.statut === `valide`
                                        ? `success`
                                        : sw.statut === `rejete`
                                          ? `error`
                                          : `warning`,
                                    variant: `outlined`,
                                    sx: { fontWeight: 700, fontSize: `0.6rem` },
                                  }),
                                ],
                              },
                              sk,
                            );
                          }),
                      }),
                    ],
                  })
                : null,
              detail
                ? (0, $.jsxs)(a, {
                    sx: {
                      p: 1.25,
                      borderRadius: 2,
                      bgcolor: `action.hover`,
                    },
                    children: [
                      (0, $.jsx)(i, {
                        variant: `caption`,
                        fontWeight: 800,
                        sx: { display: `block`, mb: 0.5 },
                        children: `Traçabilité`,
                      }),
                      (0, $.jsx)(i, {
                        variant: `caption`,
                        sx: { display: `block` },
                        children:
                          `Généré depuis pointage le ` +
                          (detail.genere_le || `—`) +
                          ` · ` +
                          (detail.valide_par
                            ? `validé par ` +
                              (R(detail.valide_par)
                                ? B(R(detail.valide_par))
                                : detail.valide_par) +
                              ` le ` +
                              (detail.valide_le || `—`)
                            : `validation en attente`) +
                          (detail.cloture_par
                            ? ` · clôturé par ` +
                              (R(detail.cloture_par)
                                ? B(R(detail.cloture_par))
                                : detail.cloture_par) +
                              ` le ` +
                              (detail.cloture_le || `—`) +
                              ` (verrouillé)`
                            : ``),
                      }),
                      detail.motif_rejet
                        ? (0, $.jsx)(c, {
                            severity: `error`,
                            sx: { mt: 1 },
                            children: `Motif de rejet : ` + detail.motif_rejet,
                          })
                        : null,
                    ],
                  })
                : null,
            ],
          }),
          (0, $.jsxs)(m, {
            sx: { px: 3, pb: 2 },
            children: [
              (0, $.jsx)(l, {
                onClick: () => setDetail(null),
                children: `Fermer`,
              }),
              detail &&
              (detail.statut === `brouillon` || detail.statut === `rejete`)
                ? (0, $.jsx)(l, {
                    variant: `contained`,
                    onClick: () => {
                      (fValider([detail.id]), setDetail(null));
                    },
                    sx: { textTransform: `none` },
                    children: `Valider ce mois`,
                  })
                : null,
              detail && detail.statut === `valide`
                ? (0, $.jsx)(l, {
                    variant: `contained`,
                    onClick: () => {
                      (fCloturer([detail.id]), setDetail(null));
                    },
                    sx: { textTransform: `none` },
                    children: `Clôturer ce mois`,
                  })
                : null,
            ],
          }),
        ],
      }),
      (0, $.jsx)(f, {
        open: dlgNew,
        onClose: () => setDlgNew(!1),
        maxWidth: `sm`,
        fullWidth: !0,
        children: [
          (0, $.jsx)(h, {
            sx: { fontWeight: 800 },
            children: `Générer le planning mensuel depuis le pointage`,
          }),
          (0, $.jsxs)(p, {
            sx: { display: `flex`, flexDirection: `column`, gap: 2 },
            children: [
              (0, $.jsx)(c, {
                severity: `info`,
                children:
                  `Le planning est agrégé jour à jour depuis le journal de pointage (codes P/R/A/M/T/F, fériés exclus) et les heures supp. validées ou payées rattachées par norme ISO 8601 (mois du jeudi). Les lignes déjà validées ou clôturées ne sont jamais modifiées.`,
              }),
              (0, $.jsxs)(a, {
                sx: { display: `flex`, gap: 2, flexWrap: `wrap` },
                children: [
                  (0, $.jsxs)(D, {
                    select: !0,
                    size: `small`,
                    label: `Exercice`,
                    value: genAn,
                    onChange: (e2) => setGenAn(e2.target.value),
                    sx: { minWidth: 120, "& .MuiInput-root": { fontSize: `0.85rem` } },
                    children: (() => {
                      var set = {};
                      plStore().records.forEach((r) => {
                        var k = plDeKey(r.mois);
                        if (k) set[k.an] = 1;
                      });
                      set[String(new Date().getFullYear())] = 1;
                      return Object.keys(set)
                        .sort()
                        .reverse()
                        .map((y2) =>
                          (0, $.jsx)(s, { value: y2, children: y2 }, y2),
                        );
                    })(),
                  }),
                  (0, $.jsxs)(D, {
                    select: !0,
                    size: `small`,
                    label: `Mois`,
                    value: genMois,
                    onChange: (e2) => setGenMois(e2.target.value),
                    sx: { minWidth: 140, "& .MuiInput-root": { fontSize: `0.85rem` } },
                    children: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m2) =>
                      (0, $.jsx)(s, { value: String(m2), children: hsMoisLabel(m2) }, m2),
                    ),
                  }),
                ],
              }),
              (0, $.jsx)(i, {
                variant: `caption`,
                sx: { color: `text.secondary` },
                children:
                  (() => {
                    var n2 = {};
                    plStore().records.forEach((r) => (n2[r.employee_id] = 1));
                    ptStore().records.forEach((r) => (n2[r.employee_id] = 1));
                    return (
                      Object.keys(n2).length +
                      ` employé(s) concerné(s) — les lignes manquantes seront créées en brouillon, celles en brouillon/rejeté recalculées.`
                    );
                  })(),
              }),
            ],
          }),
          (0, $.jsxs)(m, {
            sx: { px: 3, pb: 2 },
            children: [
              (0, $.jsx)(l, {
                onClick: () => setDlgNew(!1),
                children: `Annuler`,
              }),
              (0, $.jsx)(l, {
                variant: `contained`,
                onClick: fGen,
                sx: { bgcolor: `#7e3ff2`, textTransform: `none` },
                children: `Générer`,
              }),
            ],
          }),
        ],
      }),
      (0, $.jsx)(f, {
        open: dlgRej ? !0 : !1,
        onClose: () => setDlgRej(null),
        maxWidth: `xs`,
        fullWidth: !0,
        children: [
          (0, $.jsx)(h, {
            sx: { fontWeight: 800 },
            children: dlgRej && dlgRej.lot
              ? `Rejeter les mois sélectionnés`
              : `Rejeter le mois — ` +
                (dlgRej && dlgRej.emp ? B(dlgRej.emp) : ``) +
                ` ` +
                (dlgRej ? plMoisCourt(dlgRej.mois) : ``),
          }),
          (0, $.jsxs)(p, {
            sx: { display: `flex`, flexDirection: `column`, gap: 2 },
            children: [
              (0, $.jsx)(c, {
                severity: `warning`,
                children:
                  `Le rejet renvoie le(s) mois au statut « Rejeté » : la ligne sera recalculée à la prochaine génération après correction du journal de pointage. Le motif est obligatoire (traçabilité audit).`,
              }),
              (0, $.jsx)(D, {
                size: `small`,
                label: `Motif de rejet (obligatoire)`,
                multiline: !0,
                minRows: 2,
                value: motRej,
                onChange: (e2) => setMotRej(e2.target.value),
                sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
              }),
            ],
          }),
          (0, $.jsxs)(m, {
            sx: { px: 3, pb: 2 },
            children: [
              (0, $.jsx)(l, {
                onClick: () => setDlgRej(null),
                children: `Annuler`,
              }),
              (0, $.jsx)(l, {
                variant: `contained`,
                color: `error`,
                onClick: fConfRejeter,
                sx: { textTransform: `none` },
                children: `Rejeter`,
              }),
            ],
          }),
        ],
      }),
      (0, $.jsx)(f, {
        open: dlgPar,
        onClose: () => setDlgPar(!1),
        maxWidth: `xs`,
        fullWidth: !0,
        children: [
          (0, $.jsx)(h, {
            sx: { fontWeight: 800 },
            children: `Paramètres du planning mensuel`,
          }),
          (0, $.jsxs)(p, {
            sx: { display: `flex`, flexDirection: `column`, gap: 2 },
            children: [
              (0, $.jsx)(D, {
                size: `small`,
                type: `number`,
                label: `Seuil de taux de présence (%)`,
                value: pSt,
                onChange: (e2) => setPSt(e2.target.value),
                helperText:
                  `Alerte « à surveiller » en dessous de ce taux (KPI, pilotage, filtres).`,
                sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
              }),
              (0, $.jsx)(D, {
                size: `small`,
                type: `number`,
                label: `Jour limite de clôture (J+ n du mois suivant)`,
                value: pDl,
                onChange: (e2) => setPDl(e2.target.value),
                helperText:
                  `Un mois antérieur non clôturé après cette échéance passe « hors délai » (bandeau d'alerte).`,
                sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
              }),
              (0, $.jsxs)(D, {
                select: !0,
                size: `small`,
                label: `Génération auto du mois courant`,
                value: pGa,
                onChange: (e2) => setPGa(e2.target.value),
                sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                children: [
                  (0, $.jsx)(s, { value: `1`, children: `Oui — à l'ouverture de l'écran` }),
                  (0, $.jsx)(s, { value: `0`, children: `Non — génération manuelle uniquement` }),
                ],
              }),
              (0, $.jsx)(i, {
                variant: `caption`,
                sx: { color: `text.secondary` },
                children:
                  `Base légale : clôture mensuelle du temps de travail avant établissement des fiches de paie (art. 90 CT Cameroun — 40 h/semaine). Les paramètres affectent les KPI, les alertes et le pilotage.`,
              }),
            ],
          }),
          (0, $.jsxs)(m, {
            sx: { px: 3, pb: 2 },
            children: [
              (0, $.jsx)(l, {
                onClick: () => setDlgPar(!1),
                children: `Annuler`,
              }),
              (0, $.jsx)(l, {
                variant: `contained`,
                onClick: fSavePar,
                sx: { bgcolor: `#7e3ff2`, textTransform: `none` },
                children: `Enregistrer`,
              }),
            ],
          }),
        ],
      }),
      (0, $.jsx)(d, {
        open: snack != null,
        autoHideDuration: 3800,
        onClose: () => setSnack(null),
        anchorOrigin: { vertical: `bottom`, horizontal: `center` },
        message: snack ? snack.msg : ``,
      }),
    ],
  });
}

function HeuresSuppV2() {
  var nav = O(),
    hsFER = sldFset(),
    hsAuj = new Date().toISOString().slice(0, 10),
    hsCur = hsSemCourante();
  var stTick = (0, Q.useState)(0),
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
    stAn = (0, Q.useState)(() => hsAnAuto(hsToutes())),
    an = stAn[0],
    setAn = stAn[1],
    stMois = (0, Q.useState)(`tous`),
    moisF = stMois[0],
    setMoisF = stMois[1],
    stTri = (0, Q.useState)({ key: `lundi`, dir: `desc` }),
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
    stNew = (0, Q.useState)(!1),
    dlgNew = stNew[0],
    setDlgNew = stNew[1],
    stPar = (0, Q.useState)(!1),
    dlgPar = stPar[0],
    setDlgPar = stPar[1],
    stSel = (0, Q.useState)({}),
    sel = stSel[0],
    setSel = stSel[1],
    stRej = (0, Q.useState)(null),
    dlgRej = stRej[0],
    setDlgRej = stRej[1],
    stCh = (0, Q.useState)(0),
    chOpen = stCh[0],
    setCh = stCh[1],
    stEmpN = (0, Q.useState)(``),
    empNew = stEmpN[0],
    setEmpNew = stEmpN[1],
    stSemN = (0, Q.useState)(hsCur.key),
    semNew = stSemN[0],
    setSemNew = stSemN[1],
    stHnN = (0, Q.useState)(`40`),
    hnNew = stHnN[0],
    setHnNew = stHnN[1],
    stHN = (0, Q.useState)(``),
    hNew = stHN[0],
    setHNew = stHN[1],
    stTrN = (0, Q.useState)(`jour`),
    trNew = stTrN[0],
    setTrNew = stTrN[1],
    stMoN = (0, Q.useState)(``),
    motifNew = stMoN[0],
    setMotifNew = stMoN[1],
    stMotR = (0, Q.useState)(``),
    motRej = stMotR[0],
    setMotRej = stMotR[1],
    stPm = (0, Q.useState)(() => {
      var maxM = 0;
      var anCur = new Date().getFullYear();
      hsToutes().forEach((r) => {
        var si = hsSemInfo(r.semaine);
        if (!si || si.an !== anCur || r.statut === `rejetee`) return;
        var m3 = hsSemMois(si.num, si.an);
        if (m3 > maxM) maxM = m3;
      });
      return String(maxM || hsSemMois(hsCur.num, hsCur.an)).padStart(2, `0`);
    }),
    paieMois = stPm[0],
    setPaieMois = stPm[1],
    stParQ = (0, Q.useState)(``),
    pQuotaH = stParQ[0],
    setParQH = stParQ[1],
    stParA = (0, Q.useState)(``),
    pQuotaA = stParA[0],
    setParQA = stParA[1],
    stParJ = (0, Q.useState)(``),
    pMjJ = stParJ[0],
    setParMJ = stParJ[1],
    stParN = (0, Q.useState)(``),
    pMjN = stParN[0],
    setParMN = stParN[1],
    stParF = (0, Q.useState)(``),
    pMjF = stParF[0],
    setParMF = stParF[1],
    stParS = (0, Q.useState)(``),
    pS4 = stParS[0],
    setParS4 = stParS[1],
    stParT = (0, Q.useState)(``),
    pTd = stParT[0],
    setParTd = stParT[1];
  var depts = (0, Q.useMemo)(() => {
    var s2 = new Set();
    H.forEach((e2) => e2.departement && s2.add(e2.departement));
    return Array.from(s2).sort();
  }, []);
  var mt = (0, Q.useMemo)(() => hsMeta(hsStore()), [tick]);
  var ALL = (0, Q.useMemo)(() => {
    var m2 = hsMeta(hsStore());
    var curIdx = hsCur.an * 53 + hsCur.num;
    var base = hsToutes()
      .map((r) => {
        var si = hsSemInfo(r.semaine);
        var emp = R(r.employee_id);
        return Object.assign({}, r, {
          si: si,
          emp: emp,
          an: si ? si.an : 0,
          num: si ? si.num : 0,
          lundi: si ? hsSemLundi(si.num, si.an) : null,
          mois: si ? hsSemMois(si.num, si.an) : 0,
          tranche: r.tranche || `jour`,
          tauxNum: hsTauxNum(r),
        });
      })
      .filter((r) => r.si);
    var semMemo = {},
      anMemo = {},
      s4Memo = {},
      posMemo = {};
    base.forEach((r) => {
      if (r.statut === `rejetee`) return;
      var ks = r.employee_id + `|` + r.an + `-w` + r.num;
      posMemo[ks] = semMemo[ks] || 0;
      semMemo[ks] = (semMemo[ks] || 0) + (r.heures_supp || 0);
      var ka = r.employee_id + `|` + r.an;
      anMemo[ka] = (anMemo[ka] || 0) + (r.heures_supp || 0);
      var idx = r.an * 53 + r.num;
      if (idx <= curIdx && idx > curIdx - 4)
        s4Memo[r.employee_id] =
          (s4Memo[r.employee_id] || 0) + (r.heures_supp || 0);
    });
    base.forEach((r) => {
      r.plafSem = hsPlaf(
        semMemo[r.employee_id + `|` + r.an + `-w` + r.num] || 0,
        m2.quotaHebdo,
      );
      r.plafAn = hsPlaf(anMemo[r.employee_id + `|` + r.an] || 0, m2.quotaAn);
      r.s4 = s4Memo[r.employee_id] || 0;
      r.surcharge = r.s4 > m2.seuilS4;
      r.dateDecl =
        r.date_decl ||
        (r.lundi
          ? new Date(r.lundi.getTime() + 864e5).toISOString().slice(0, 10)
          : null);
      r.retard =
        r.statut === `en_attente` && r.dateDecl
          ? Date.now() - new Date(r.dateDecl).getTime() > 5 * 864e5
          : !1;
      r.posSem = posMemo[r.employee_id + `|` + r.an + `-w` + r.num] || 0;
      r.hsCalc = hsCalcRow(
        r.heures_supp || 0,
        hsTauxHoraire(r.emp, m2),
        r.tranche,
        m2,
        r.posSem,
      );
      r.attendu = r.hsCalc.montant;
      r.mjLegal = 100 + hsMjTranche(r.tranche, m2);
      r.tauxBas =
        m2.modeCalc === `prog` && (r.tranche || `jour`) === `jour`
          ? !1
          : r.tauxNum < r.mjLegal;
      r.ecart =
        r.montant_calcule > 0 && r.attendu > 0
          ? Math.abs(r.montant_calcule - r.attendu) / r.attendu > 0.25
          : !1;
    });
    return base;
  }, [tick]);
  var annees = (0, Q.useMemo)(() => {
    var s2 = new Set();
    ALL.forEach((r) => s2.add(String(r.an)));
    return Array.from(s2).sort().reverse();
  }, [ALL]);
  var allAn = (0, Q.useMemo)(
    () =>
      an === `tous` ? ALL : ALL.filter((r) => String(r.an) === String(an)),
    [ALL, an],
  );
  var srt = (0, Q.useMemo)(() => {
    var out = allAn.filter((r) => {
      if (dept !== `tous` && ((r.emp && r.emp.departement) || `—`) !== dept)
        return !1;
      if (moisF !== `tous` && String(r.mois).padStart(2, `0`) !== String(moisF))
        return !1;
      if (statutF === `tous`) return !0;
      if (statutF === `surcharge`) return r.surcharge;
      if (statutF === `retard`) return r.retard;
      if (statutF === `plafond`) return r.plafSem.etat !== `ok`;
      if (statutF === `ecart`) return r.ecart;
      if (statutF === `taux_bas`) return r.tauxBas;
      return r.statut === statutF;
    });
    if (rech) {
      var q2 = rech.toLowerCase();
      out = out.filter((r) => {
        var nm = r.emp ? B(r.emp).toLowerCase() : ``;
        return (
          nm.includes(q2) ||
          ((r.emp && r.emp.matricule) || ``).toLowerCase().includes(q2) ||
          String(r.semaine || ``)
            .toLowerCase()
            .includes(q2) ||
          String(r.motif || ``)
            .toLowerCase()
            .includes(q2) ||
          String(r.montant_calcule || ``).includes(q2)
        );
      });
    }
    var kk = tri.key,
      dd = tri.dir === `asc` ? 1 : -1;
    out.sort((a1, b1) => {
      var x2, y2;
      if (kk === `emp`) {
        x2 = a1.emp ? B(a1.emp) : ``;
        y2 = b1.emp ? B(b1.emp) : ``;
      } else if (kk === `hs`) {
        x2 = a1.heures_supp || 0;
        y2 = b1.heures_supp || 0;
      } else if (kk === `montant`) {
        x2 = a1.montant_calcule || 0;
        y2 = b1.montant_calcule || 0;
      } else if (kk === `statut`) {
        x2 = a1.statut || ``;
        y2 = b1.statut || ``;
      } else {
        x2 = a1.lundi ? a1.lundi.getTime() : 0;
        y2 = b1.lundi ? b1.lundi.getTime() : 0;
      }
      return x2 < y2 ? -1 * dd : x2 > y2 ? dd : 0;
    });
    return out;
  }, [allAn, dept, moisF, statutF, rech, tri]);
  var kpiMois = (0, Q.useMemo)(() => {
    var mc = String(hsSemMois(hsCur.num, hsCur.an)).padStart(2, `0`);
    var rows = allAn.filter(
      (r) => r.statut !== `rejetee` && String(r.mois).padStart(2, `0`) === mc,
    );
    if (!rows.length) {
      var maxM = 0;
      allAn.forEach((r) => {
        if (r.statut !== `rejetee` && r.mois > maxM) maxM = r.mois;
      });
      if (maxM > 0) {
        mc = String(maxM).padStart(2, `0`);
        rows = allAn.filter(
          (r) =>
            r.statut !== `rejetee` && String(r.mois).padStart(2, `0`) === mc,
        );
      }
    }
    var h = 0,
      fc = 0;
    rows.forEach((r) => {
      h += r.heures_supp || 0;
      if (r.statut !== `en_attente`) fc += r.montant_calcule || 0;
    });
    return { mois: mc, n: rows.length, h: h, fc: fc };
  }, [allAn]);
  var kpiAtt = (0, Q.useMemo)(() => {
    var rows = allAn.filter((r) => r.statut === `en_attente`);
    var h = 0,
      fc = 0;
    rows.forEach((r) => {
      h += r.heures_supp || 0;
      fc += r.montant_calcule || 0;
    });
    return { n: rows.length, h: h, fc: fc };
  }, [allAn]);
  var kpiCout = (0, Q.useMemo)(() => {
    var fc = 0,
      h = 0;
    allAn.forEach((r) => {
      if (r.statut === `validee` || r.statut === `payee`) {
        fc += r.montant_calcule || 0;
        h += r.heures_supp || 0;
      }
    });
    return { fc: fc, h: h };
  }, [allAn]);
  var kpiSur = (0, Q.useMemo)(() => {
    var m2 = {};
    allAn.forEach((r) => {
      if (r.surcharge) m2[r.employee_id] = 1;
    });
    return Object.keys(m2).length;
  }, [allAn]);
  var hsDD = (0, Q.useMemo)(
    () => hsDeltaAn(ALL, an === `tous` ? new Date().getFullYear() : an),
    [ALL, an],
  );
  var fTri = (key) =>
    setTri((tr) => ({
      key: key,
      dir: tr.key === key && tr.dir === `asc` ? `desc` : `asc`,
    }));
  var fTh = (label, key, align) =>
    (0, $.jsx)(
      v,
      {
        align: align || `left`,
        sx: {
          fontWeight: 700,
          whiteSpace: `nowrap`,
          bgcolor: `background.default`,
        },
        children: (0, $.jsxs)(a, {
          sx: {
            display: `inline-flex`,
            alignItems: `center`,
            gap: 0.5,
            cursor: `pointer`,
            userSelect: `none`,
            "&:hover": { color: `primary.main` },
          },
          onClick: () => fTri(key),
          children: [
            label,
            tri.key === key
              ? (0, $.jsx)(tri.dir === `asc` ? AU : AD, {
                  sx: { fontSize: 15, color: `primary.main` },
                })
              : (0, $.jsx)(a, { sx: { width: 15 } }),
          ],
        }),
      },
      key,
    );
  var fPatch = (id, patch, msg) => {
    var st = hsStore();
    st.patches = st.patches || {};
    st.patches[id] = Object.assign({}, st.patches[id], patch);
    hsSave(st);
    setTick(tick + 1);
    setSnack({ msg: msg, sev: `success` });
  };
  var fValide = (r) =>
    fPatch(
      r.id,
      { statut: `validee`, valide_par: HS_VALID, valide_le: hsAuj },
      `Heures supplémentaires validées — ` +
        B(r.emp) +
        ` · ` +
        r.heures_supp +
        ` h (` +
        r.semaine +
        `). Intégration paie autorisée.`,
    );
  var fValideSel = () => {
    var ids = Object.keys(sel);
    if (!ids.length) return;
    var st = hsStore();
    st.patches = st.patches || {};
    ids.forEach((id) => {
      st.patches[id] = Object.assign({}, st.patches[id], {
        statut: `validee`,
        valide_par: HS_VALID,
        valide_le: hsAuj,
      });
    });
    hsSave(st);
    setSel({});
    setTick(tick + 1);
    setSnack({
      msg:
        ids.length +
        ` déclaration(s) validée(s) en lot — intégration paie autorisée.`,
      sev: `success`,
    });
  };
  var fRejeteConf = () => {
    if (!dlgRej) return;
    fPatch(
      dlgRej.id,
      {
        statut: `rejetee`,
        motif_rejet: motRej || `Non conforme`,
        valide_le: hsAuj,
      },
      `Déclaration rejetée — ` + B(dlgRej.emp) + ` (` + dlgRej.semaine + `).`,
    );
    setDlgRej(null);
    setMotRej(``);
  };
  var fNew = () => {
    if (!empNew || !semNew || !hNew || parseInt(hNew, 10) <= 0)
      return setSnack({
        msg: `Employé, semaine et nombre d'heures supplémentaires obligatoires.`,
        sev: `warning`,
      });
    var st = hsStore();
    var si = hsSemInfo(semNew);
    var emp = R(empNew);
    var h = parseInt(hNew, 10);
    var mj = hsMjTranche(trNew, mt);
    var th = hsTauxHoraire(emp, mt);
    var posN = hsPosSem(empNew, semNew);
    var id = `hs-v2-` + Date.now();
    var rec = {
      id: id,
      employee_id: empNew,
      semaine: semNew,
      heures_normales: parseInt(hnNew, 10) || 40,
      heures_supp: h,
      tranche: trNew,
      taux_majoration:
        mt.modeCalc === `prog` && (trNew || `jour`) === `jour`
          ? `progressif`
          : 100 + mj + `%`,
      montant_brut: Math.round(h * th),
      montant_calcule: hsCalcRow(h, th, trNew, mt, posN).montant,
      statut: `en_attente`,
      valide_par: null,
      valide_le: null,
      date_decl: hsAuj,
      motif: motifNew || (HS_TRANCHES[trNew] || HS_TRANCHES.jour)[0],
    };
    st.records = st.records || [];
    st.records.push(rec);
    hsSave(st);
    setDlgNew(!1);
    setEmpNew(``);
    setHNew(``);
    setMotifNew(``);
    setTick(tick + 1);
    setSnack({
      msg:
        `Déclaration enregistrée — ` +
        B(emp) +
        ` · ` +
        h +
        ` h (` +
        semNew +
        `). En attente de validation manager.`,
      sev: `success`,
    });
  };
  var fOpenPar = () => {
    setParQH(String(mt.quotaHebdo));
    setParQA(String(mt.quotaAn));
    setParMJ(String(mt.mjJour));
    setParMN(String(mt.mjNuit));
    setParMF(String(mt.mjFerie));
    setParS4(String(mt.seuilS4));
    setParTd(String(mt.tauxDefaut));
    setDlgPar(!0);
  };
  var fSavePar = () => {
    var st = hsStore();
    st.meta = Object.assign({}, st.meta, {
      quotaHebdo: parseInt(pQuotaH, 10) || 20,
      quotaAn: parseInt(pQuotaA, 10) || 240,
      mjJour: parseInt(pMjJ, 10) || 0,
      mjNuit: parseInt(pMjN, 10) || 0,
      mjFerie: parseInt(pMjF, 10) || 0,
      seuilS4: parseInt(pS4, 10) || 30,
      tauxDefaut: parseInt(pTd, 10) || 1500,
    });
    hsSave(st);
    setDlgPar(!1);
    setTick(tick + 1);
    setSnack({
      msg: `Paramètres enregistrés — plafonds et majorations appliqués à tout le cockpit.`,
      sev: `success`,
    });
  };
  var stTxD = (0, Q.useState)(!1),
    txDlg = stTxD[0],
    setTxDlg = stTxD[1],
    stTxP = (0, Q.useState)(`CM`),
    txPays = stTxP[0],
    setTxPays = stTxP[1],
    stTxM = (0, Q.useState)(`simple`),
    txMode = stTxM[0],
    setTxMode = stTxM[1],
    stTxB = (0, Q.useState)(``),
    txBrk = stTxB[0],
    setTxBrk = stTxB[1],
    stTxJ = (0, Q.useState)(``),
    txJ = stTxJ[0],
    setTxJ = stTxJ[1],
    stTxN = (0, Q.useState)(``),
    txN = stTxN[0],
    setTxN = stTxN[1],
    stTxF = (0, Q.useState)(``),
    txF = stTxF[0],
    setTxF = stTxF[1],
    stTxDJ = (0, Q.useState)(``),
    txDJ = stTxDJ[0],
    setTxDJ = stTxDJ[1],
    stTxDN = (0, Q.useState)(``),
    txDN = stTxDN[0],
    setTxDN = stTxDN[1],
    stTxFJ = (0, Q.useState)(``),
    txFJ = stTxFJ[0],
    setTxFJ = stTxFJ[1],
    stTxFN = (0, Q.useState)(``),
    txFN = stTxFN[0],
    setTxFN = stTxFN[1],
    stTxQH = (0, Q.useState)(``),
    txQH = stTxQH[0],
    setTxQH = stTxQH[1],
    stTxQA = (0, Q.useState)(``),
    txQA = stTxQA[0],
    setTxQA = stTxQA[1],
    stTxTD = (0, Q.useState)(``),
    txTD = stTxTD[0],
    setTxTD = stTxTD[1],
    stTxH = (0, Q.useState)(`5`),
    txH = stTxH[0],
    setTxH = stTxH[1],
    stTxC = (0, Q.useState)(`jour`),
    txCat = stTxC[0],
    setTxCat = stTxC[1],
    stTxT = (0, Q.useState)(``),
    txTh = stTxT[0],
    setTxTh = stTxT[1],
    stTxPs = (0, Q.useState)(`0`),
    txPos = stTxPs[0],
    setTxPos = stTxPs[1];
  var fMetaForm = () => {
    var brs = String(txBrk || ``)
      .split(`,`)
      .map((s3) => s3.trim().split(`:`))
      .map((p2) => [parseInt(p2[0], 10) || 0, parseInt(p2[1], 10) || 0])
      .filter((p2) => p2[0] > 0);
    return {
      quotaHebdo: parseInt(txQH, 10) || 20,
      quotaAn: parseInt(txQA, 10) || 240,
      mjJour: parseInt(txJ, 10) || 0,
      mjNuit: parseInt(txN, 10) || 0,
      mjFerie: parseInt(txF, 10) || 0,
      mjDimJ: parseInt(txDJ, 10) || 0,
      mjDimN: parseInt(txDN, 10) || 0,
      mjFerJ: parseInt(txFJ, 10) || 0,
      mjFerN: parseInt(txFN, 10) || 0,
      seuilS4: mt.seuilS4,
      tauxDefaut: parseInt(txTD, 10) || 1500,
      pays: txPays,
      modeCalc: txMode === `prog` ? `prog` : `simple`,
      brackets: brs.length
        ? brs
        : [
            [8, 20],
            [8, 30],
            [4, 40],
          ],
    };
  };
  var fOpenTaux = () => {
    setTxPays(mt.pays || `CM`);
    setTxMode(mt.modeCalc || `simple`);
    setTxBrk((mt.brackets || []).map((b) => b[0] + `:` + b[1]).join(`, `));
    setTxJ(String(mt.mjJour));
    setTxN(String(mt.mjNuit));
    setTxF(String(mt.mjFerie));
    setTxDJ(String(mt.mjDimJ));
    setTxDN(String(mt.mjDimN));
    setTxFJ(String(mt.mjFerJ));
    setTxFN(String(mt.mjFerN));
    setTxQH(String(mt.quotaHebdo));
    setTxQA(String(mt.quotaAn));
    setTxTD(String(mt.tauxDefaut));
    setTxTh(String(mt.tauxDefaut));
    setTxH(`5`);
    setTxCat(`jour`);
    setTxPos(`0`);
    setTxDlg(!0);
  };
  var fPickPays = (k) => {
    var p2 = HS_PAYS[k];
    if (!p2) return;
    setTxPays(k);
    setTxMode(p2.modeCalc);
    setTxBrk(p2.brackets.map((b) => b[0] + `:` + b[1]).join(`, `));
    setTxJ(String(p2.mj.jour));
    setTxN(String(p2.mj.nuit));
    setTxF(String(p2.mj.feries));
    setTxDJ(String(p2.mj.dim_j));
    setTxDN(String(p2.mj.dim_n));
    setTxFJ(String(p2.mj.fer_j));
    setTxFN(String(p2.mj.fer_n));
    setTxQH(String(p2.quotaHebdo));
    setTxQA(String(p2.quotaAn));
  };
  var fSaveMeta = () => {
    var st = hsStore();
    st.meta = Object.assign({}, st.meta, fMetaForm());
    hsSave(st);
    return st.meta;
  };
  var fSaveTaux = () => {
    fSaveMeta();
    setTxDlg(!1);
    setTick(tick + 1);
    setSnack({
      msg:
        `Configuration de taux enregistrée — ` +
        (HS_PAYS[txPays] || HS_PAYS.XX).nom +
        ` (` +
        (txMode === `prog`
          ? `jour progressif par tranches`
          : `taux simples par catégorie`) +
        `). Montants attendus, taux bas et plafonds recalculés.`,
      sev: `success`,
    });
  };
  var fApplTaux = () => {
    var m2 = fSaveMeta();
    var n = hsApplTout(m2);
    setTick(tick + 1);
    setSnack({
      msg:
        `Taux « ` +
        (HS_PAYS[m2.pays] || HS_PAYS.XX).nom +
        ` » appliqués au tableau — ` +
        n +
        ` ligne(s) recalculée(s) (taux + montants). Vous voyez désormais la configuration à l'œuvre sur chaque ligne.`,
      sev: `success`,
    });
  };
  var hsDlgTaux = () => {
    var mtF = fMetaForm();
    var simTh2 = parseFloat(String(txTh).replace(`,`, `.`)) || 0;
    var simH2 = parseInt(txH, 10) || 0;
    var simPos2 = parseInt(txPos, 10) || 0;
    var simCalc = hsCalcRow(simH2, simTh2, txCat, mtF, simPos2);
    return (0, $.jsxs)(f, {
      open: txDlg,
      onClose: () => setTxDlg(!1),
      maxWidth: `lg`,
      fullWidth: !0,
      children: [
        (0, $.jsx)(h, {
          sx: { fontWeight: 800 },
          children: `Configurateur de taux — majorations légales, combinaisons & simulateur`,
        }),
        (0, $.jsxs)(p, {
          sx: { display: `flex`, flexDirection: `column`, gap: 2 },
          children: [
            (0, $.jsxs)(D, {
              select: !0,
              size: `small`,
              label: `Pays / région — préréglage légal`,
              value: txPays,
              onChange: (e2) => fPickPays(e2.target.value),
              sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
              children: Object.keys(HS_PAYS).map((k) =>
                (0, $.jsx)(
                  s,
                  {
                    value: k,
                    children: (k === `XX` ? `⚙ ` : ``) + HS_PAYS[k].nom,
                  },
                  k,
                ),
              ),
            }),
            (0, $.jsx)(c, {
              severity: `info`,
              children:
                (HS_PAYS[txPays] || HS_PAYS.XX).ref +
                `. Ces taux sont des MINIMA légaux : ajustez librement chaque champ (convention collective plus favorable) puis appliquez au tableau.`,
            }),
            (0, $.jsxs)(a, {
              sx: { display: `grid`, gridTemplateColumns: `1fr 2fr`, gap: 2 },
              children: [
                (0, $.jsxs)(D, {
                  select: !0,
                  size: `small`,
                  label: `Mode de calcul`,
                  value: txMode,
                  onChange: (e2) => setTxMode(e2.target.value),
                  sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                  children: [
                    (0, $.jsx)(s, {
                      value: `simple`,
                      children: `Taux simple par catégorie`,
                    }),
                    (0, $.jsx)(s, {
                      value: `prog`,
                      children: `Progressif par tranches (jour)`,
                    }),
                  ],
                }),
                txMode === `prog`
                  ? (0, $.jsx)(D, {
                      size: `small`,
                      label: `Tranches heures:majoration (ex. 8:20, 8:30, 4:40)`,
                      value: txBrk,
                      onChange: (e2) => setTxBrk(e2.target.value),
                      sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                    })
                  : (0, $.jsx)(i, {
                      variant: `caption`,
                      sx: { color: `text.secondary`, alignSelf: `center` },
                      children: `Mode simple : chaque catégorie (jour, nuit, dimanche, férié…) applique sa propre majoration.`,
                    }),
              ],
            }),
            txMode === `prog`
              ? (0, $.jsx)(i, {
                  variant: `caption`,
                  sx: { color: `text.secondary` },
                  children:
                    `Aperçu des tranches (position dans la semaine) : ` +
                    hsBrkLbl(mtF) +
                    ` — la nuit et les dimanches/fériés gardent leur taux propre.`,
                })
              : null,
            (0, $.jsx)(i, {
              variant: `subtitle2`,
              sx: { fontWeight: 800, mt: 0.5 },
              children: `Majorations par catégorie (%) — combinaisons jour × nuit × dimanche × férié`,
            }),
            (0, $.jsxs)(a, {
              sx: {
                display: `grid`,
                gridTemplateColumns: `repeat(4,1fr)`,
                gap: 1.5,
              },
              children: [
                (0, $.jsx)(D, {
                  type: `number`,
                  size: `small`,
                  label: `Jour ouvrable`,
                  value: txJ,
                  onChange: (e2) => setTxJ(e2.target.value),
                  sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                }),
                (0, $.jsx)(D, {
                  type: `number`,
                  size: `small`,
                  label: `Nuit ouvrable`,
                  value: txN,
                  onChange: (e2) => setTxN(e2.target.value),
                  sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                }),
                (0, $.jsx)(D, {
                  type: `number`,
                  size: `small`,
                  label: `Dimanche — jour`,
                  value: txDJ,
                  onChange: (e2) => setTxDJ(e2.target.value),
                  sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                }),
                (0, $.jsx)(D, {
                  type: `number`,
                  size: `small`,
                  label: `Dimanche — nuit`,
                  value: txDN,
                  onChange: (e2) => setTxDN(e2.target.value),
                  sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                }),
                (0, $.jsx)(D, {
                  type: `number`,
                  size: `small`,
                  label: `Férié — jour`,
                  value: txFJ,
                  onChange: (e2) => setTxFJ(e2.target.value),
                  sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                }),
                (0, $.jsx)(D, {
                  type: `number`,
                  size: `small`,
                  label: `Férié — nuit`,
                  value: txFN,
                  onChange: (e2) => setTxFN(e2.target.value),
                  sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                }),
                (0, $.jsx)(D, {
                  type: `number`,
                  size: `small`,
                  label: `Dim. & férié (ancien)`,
                  value: txF,
                  onChange: (e2) => setTxF(e2.target.value),
                  sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                }),
              ],
            }),
            (0, $.jsx)(i, {
              variant: `subtitle2`,
              sx: { fontWeight: 800 },
              children: `Plafonds & base`,
            }),
            (0, $.jsxs)(a, {
              sx: {
                display: `grid`,
                gridTemplateColumns: `repeat(3,1fr)`,
                gap: 1.5,
              },
              children: [
                (0, $.jsx)(D, {
                  type: `number`,
                  size: `small`,
                  label: `Plafond HS / semaine (h)`,
                  value: txQH,
                  onChange: (e2) => setTxQH(e2.target.value),
                  sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                }),
                (0, $.jsx)(D, {
                  type: `number`,
                  size: `small`,
                  label: `Quota HS / an (h)`,
                  value: txQA,
                  onChange: (e2) => setTxQA(e2.target.value),
                  sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                }),
                (0, $.jsx)(D, {
                  type: `number`,
                  size: `small`,
                  label: `Taux horaire par défaut (FCFA/h)`,
                  value: txTD,
                  onChange: (e2) => setTxTD(e2.target.value),
                  sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                }),
              ],
            }),
            (0, $.jsxs)(ee, {
              sx: { borderRadius: 2, bgcolor: `background.default` },
              children: [
                (0, $.jsxs)(u, {
                  sx: { display: `flex`, flexDirection: `column`, gap: 1.5 },
                  children: [
                    (0, $.jsxs)(a, {
                      sx: { display: `flex`, alignItems: `center`, gap: 1 },
                      children: [
                        (0, $.jsx)(AT, {
                          sx: { fontSize: 18, color: `#7e3ff2` },
                        }),
                        (0, $.jsx)(i, {
                          variant: `subtitle2`,
                          fontWeight: 800,
                          children: `Simulateur de formule — pas à pas`,
                        }),
                        (0, $.jsx)(T, {
                          label: (HS_PAYS[txPays] || HS_PAYS.XX).nom,
                          size: `small`,
                          color: `primary`,
                          variant: `outlined`,
                          sx: { fontWeight: 800, fontSize: `0.6rem` },
                        }),
                      ],
                    }),
                    (0, $.jsxs)(a, {
                      sx: {
                        display: `grid`,
                        gridTemplateColumns: `repeat(4,1fr)`,
                        gap: 1.5,
                      },
                      children: [
                        (0, $.jsx)(D, {
                          type: `number`,
                          size: `small`,
                          label: `Heures à simuler`,
                          value: txH,
                          onChange: (e2) => setTxH(e2.target.value),
                          sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                        }),
                        (0, $.jsxs)(D, {
                          select: !0,
                          size: `small`,
                          label: `Combinaison`,
                          value: txCat,
                          onChange: (e2) => setTxCat(e2.target.value),
                          sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                          children: HS_CATS6.map((k) =>
                            (0, $.jsx)(
                              s,
                              {
                                value: k,
                                children: (HS_TRANCHES[k] || [k])[0],
                              },
                              k,
                            ),
                          ),
                        }),
                        (0, $.jsx)(D, {
                          type: `number`,
                          size: `small`,
                          label: `Taux horaire de base (FCFA/h)`,
                          value: txTh,
                          onChange: (e2) => setTxTh(e2.target.value),
                          sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                        }),
                        txMode === `prog` && txCat === `jour`
                          ? (0, $.jsx)(D, {
                              type: `number`,
                              size: `small`,
                              label: `Position déjà cumulée (h, semaine)`,
                              value: txPos,
                              onChange: (e2) => setTxPos(e2.target.value),
                              sx: {
                                "& .MuiInput-root": { fontSize: `0.85rem` },
                              },
                            })
                          : null,
                      ],
                    }),
                    simH2 > 0 && simTh2 > 0
                      ? (0, $.jsxs)(a, {
                          sx: {
                            display: `flex`,
                            flexDirection: `column`,
                            gap: 0.3,
                          },
                          children: [
                            (0, $.jsx)(i, {
                              variant: `caption`,
                              sx: { color: `text.secondary` },
                              children: simCalc.prog
                                ? `Ventilation par tranches (position départ : ` +
                                  simPos2 +
                                  `e heure HS de la semaine) :`
                                : `Formule appliquée :`,
                            }),
                            simCalc.det.map((d2, ix2) =>
                              (0, $.jsx)(
                                i,
                                {
                                  variant: `caption`,
                                  sx: {
                                    fontFamily: `monospace`,
                                    fontWeight: 700,
                                    ml: 1,
                                  },
                                  children:
                                    d2[0] +
                                    ` h × ` +
                                    sldFCFA(Math.round(simTh2)) +
                                    ` × ` +
                                    (1 + d2[1] / 100)
                                      .toFixed(2)
                                      .replace(`.`, `,`) +
                                    ` (majoration +` +
                                    d2[1] +
                                    ` %) = ` +
                                    sldFCFA(
                                      Math.round(
                                        d2[0] * simTh2 * (1 + d2[1] / 100),
                                      ),
                                    ),
                                },
                                ix2,
                              ),
                            ),
                            (0, $.jsx)(i, {
                              variant: `caption`,
                              sx: {
                                fontFamily: `monospace`,
                                fontWeight: 800,
                                color: `#7e3ff2`,
                              },
                              children: `Total = ` + sldFCFA(simCalc.montant),
                            }),
                          ],
                        })
                      : (0, $.jsx)(i, {
                          variant: `caption`,
                          sx: { color: `text.secondary` },
                          children: `Saisissez les heures et le taux horaire de base pour afficher le calcul pas à pas selon la configuration.`,
                        }),
                  ],
                }),
              ],
            }),
            (0, $.jsx)(i, {
              variant: `subtitle2`,
              sx: { fontWeight: 800 },
              children: `Matrice des combinaisons — taux horaire majoré par catégorie (cliquez pour simuler)`,
            }),
            (0, $.jsx)(a, {
              sx: { display: `flex`, flexDirection: `column`, gap: 0.5 },
              children: HS_CATS6.map((k2) => {
                var mj2 = hsMjCat(k2, mtF);
                var c2 = hsCalcRow(simH2, simTh2, k2, mtF, simPos2);
                return (0, $.jsxs)(
                  a,
                  {
                    onClick: () => setTxCat(k2),
                    sx: {
                      display: `flex`,
                      alignItems: `center`,
                      gap: 1,
                      p: 0.5,
                      borderRadius: 1,
                      cursor: `pointer`,
                      bgcolor: k2 === txCat ? `action.selected` : `transparent`,
                      "&:hover": { bgcolor: `action.hover` },
                    },
                    children: [
                      (0, $.jsx)(T, {
                        label: (HS_TRANCHES[k2] || [k2])[0],
                        size: `small`,
                        variant: k2 === txCat ? `filled` : `outlined`,
                        color: k2 === txCat ? `primary` : `default`,
                        sx: {
                          fontWeight: 700,
                          fontSize: `0.62rem`,
                          minWidth: 185,
                        },
                      }),
                      (0, $.jsx)(i, {
                        variant: `caption`,
                        sx: { width: 64, fontWeight: 700 },
                        children: `+` + mj2 + ` %`,
                      }),
                      (0, $.jsx)(i, {
                        variant: `caption`,
                        sx: { width: 140, fontWeight: 700 },
                        children:
                          sldFCFA(Math.round(simTh2 * (1 + mj2 / 100))) +
                          ` / h`,
                      }),
                      mtF.modeCalc === `prog` && k2 === `jour`
                        ? (0, $.jsx)(i, {
                            variant: `caption`,
                            sx: { color: `text.secondary`, flex: 1 },
                            children: `Progressif : ` + hsBrkLbl(mtF),
                          })
                        : (0, $.jsx)(i, {
                            variant: `caption`,
                            sx: { color: `text.secondary`, flex: 1 },
                            children: (HS_TRANCHES[k2] || [k2])[0],
                          }),
                      (0, $.jsx)(i, {
                        variant: `caption`,
                        fontWeight: 800,
                        children: simH2 > 0 ? sldFCFA(c2.montant) : `—`,
                      }),
                    ],
                  },
                  k2,
                );
              }),
            }),
          ],
        }),
        (0, $.jsxs)(m, {
          sx: { px: 3, pb: 2 },
          children: [
            (0, $.jsx)(l, { onClick: () => setTxDlg(!1), children: `Fermer` }),
            (0, $.jsx)(l, {
              variant: `outlined`,
              onClick: fSaveTaux,
              sx: { textTransform: `none` },
              children: `Enregistrer la configuration`,
            }),
            (0, $.jsx)(l, {
              variant: `contained`,
              onClick: fApplTaux,
              sx: { bgcolor: `#7e3ff2`, textTransform: `none` },
              children: `Appliquer & recalculer le tableau`,
            }),
          ],
        }),
      ],
    });
  };
  var hsCvsRows = (rows) => {
    var out = [
      [
        `Matricule`,
        `Employé`,
        `Département`,
        `Semaine`,
        `Semaine du`,
        `H. normales`,
        `H. supp`,
        `Tranche`,
        `Taux`,
        `Montant (FCFA)`,
        `Statut`,
        `Validé par`,
        `Lot paie`,
        `Motif`,
      ],
    ];
    rows.forEach((r) => {
      out.push(
        [
          (r.emp && r.emp.matricule) || `—`,
          r.emp ? B(r.emp) : r.employee_id,
          (r.emp && r.emp.departement) || `—`,
          r.semaine,
          r.lundi ? A(r.lundi.toISOString().slice(0, 10)) : `—`,
          r.heures_normales,
          r.heures_supp,
          (HS_TRANCHES[r.tranche] || HS_TRANCHES.jour)[0],
          r.taux_majoration,
          r.montant_calcule || 0,
          (HS_ST[r.statut] || [r.statut])[0],
          r.valide_par && R(r.valide_par) ? B(R(r.valide_par)) : `—`,
          r.paie_lot || ``,
          r.motif || ``,
        ].map((x2) =>
          String(x2 == null ? `` : x2)
            .replace(/;/g, `,`)
            .replace(/\n/g, ` `),
        ),
      );
    });
    return out;
  };
  var hsCsvDl = (rows, nom, msg) => {
    var blb = new Blob(
      [
        `\uFEFF` +
          hsCvsRows(rows)
            .map((l2) => l2.join(`;`))
            .join(`\n`),
      ],
      { type: `text/csv;charset=utf-8` },
    );
    var url = URL.createObjectURL(blb);
    var lk = document.createElement(`a`);
    ((lk.href = url), (lk.download = nom), lk.click());
    setSnack({ msg: msg, sev: `success` });
  };
  var fExport = () =>
    hsCsvDl(
      srt,
      `heures_supplementaires_admina.csv`,
      `Export CSV généré — ` + srt.length + ` ligne(s).`,
    );
  var fLot = () => {
    var rows = allAn.filter(
      (r) =>
        r.statut === `validee` &&
        !r.paie_lot &&
        String(r.mois).padStart(2, `0`) === String(paieMois),
    );
    if (!rows.length)
      return setSnack({
        msg: `Aucune heure validée prête pour ce mois — rien à intégrer au lot paie.`,
        sev: `info`,
      });
    var st = hsStore();
    st.patches = st.patches || {};
    rows.forEach((r) => {
      st.patches[r.id] = Object.assign({}, st.patches[r.id], {
        paie_lot: paieMois + `-` + an,
      });
    });
    hsSave(st);
    setTick(tick + 1);
    hsCsvDl(
      rows,
      `lot_paie_heures_supp_` + paieMois + `-` + an + `.csv`,
      `Lot paie ` +
        paieMois +
        `-` +
        an +
        ` généré — ` +
        rows.length +
        ` ligne(s), ` +
        sldFCFA(rows.reduce((s2, r) => s2 + (r.montant_calcule || 0), 0)) +
        `. Fichier CSV prêt pour la paie.`,
    );
  };
  /* — Statistiques pilotage visuel & lot paie — */
  var chSt = { en_attente: 0, validee: 0, rejetee: 0, payee: 0 };
  srt.forEach((r) => {
    if (chSt[r.statut] !== undefined) chSt[r.statut] += 1;
  });
  var chDepts = (function () {
    var m2 = {};
    srt.forEach((r) => {
      var dp = (r.emp && r.emp.departement) || `—`;
      if (!m2[dp]) m2[dp] = { dept: dp, n: 0, h: 0, co: 0 };
      m2[dp].n++;
      m2[dp].h += r.heures_supp || 0;
      if (r.statut !== `en_attente` && r.statut !== `rejetee`)
        m2[dp].co += r.montant_calcule || 0;
    });
    return Object.keys(m2)
      .map((k2) => m2[k2])
      .sort((a1, a2) => a2.h - a1.h)
      .slice(0, 8);
  })();
  var chDeptsMax = chDepts.length
    ? Math.max.apply(
        null,
        chDepts.map((x2) => x2.h),
      )
    : 0;
  var hsMois = hsMoisSerie(
    allAn,
    an === `tous` ? new Date().getFullYear() : an,
  );
  var hsMoisMax = Math.max.apply(null, hsMois.concat([0]));
  var hsTop5 = (function () {
    var m2 = {};
    allAn.forEach((r) => {
      if (r.statut === `rejetee`) return;
      var k2 = r.employee_id;
      if (!m2[k2]) m2[k2] = { emp: r.emp, id: k2, h: 0, co: 0 };
      m2[k2].h += r.heures_supp || 0;
      m2[k2].co += r.montant_calcule || 0;
    });
    return Object.keys(m2)
      .map((k2) => m2[k2])
      .sort((a1, b1) => b1.h - a1.h)
      .slice(0, 5);
  })();
  var hsTopMax = hsTop5.length
    ? Math.max.apply(
        null,
        hsTop5.map((x2) => x2.h),
      )
    : 0;
  var rowsPaie = allAn.filter(
    (r) => String(r.mois).padStart(2, `0`) === String(paieMois),
  );
  var paiePretes = rowsPaie.filter(
    (r) => r.statut === `validee` && !r.paie_lot,
  );
  var paieLot = rowsPaie.filter(
    (r) => r.paie_lot === String(paieMois) + `-` + String(an),
  );
  var paiePayees = rowsPaie.filter((r) => r.statut === `payee`);
  var paiePretesFc = paiePretes.reduce(
    (s2, r) => s2 + (r.montant_calcule || 0),
    0,
  );
  var paieLotFc = paieLot.reduce((s2, r) => s2 + (r.montant_calcule || 0), 0);
  var paiePayeesFc = paiePayees.reduce(
    (s2, r) => s2 + (r.montant_calcule || 0),
    0,
  );
  var hsDlgDetail = () =>
    (0, $.jsxs)(f, {
      open: !!det,
      onClose: () => setDetail(null),
      maxWidth: `sm`,
      fullWidth: !0,
      children: [
        (0, $.jsx)(h, {
          sx: { fontWeight: 800 },
          children: det
            ? `HS — ` + B(det.emp) + ` · ` + det.semaine
            : `Heures supplémentaires`,
        }),
        (0, $.jsxs)(p, {
          sx: { display: `flex`, flexDirection: `column`, gap: 1.5 },
          children: [
            det
              ? (0, $.jsxs)(a, {
                  sx: {
                    display: `grid`,
                    gridTemplateColumns: `repeat(3,1fr)`,
                    gap: 1,
                  },
                  children: [
                    (0, $.jsx)(AbsTuile, {
                      label: `Semaine`,
                      valeur: det.lundi
                        ? A(det.lundi.toISOString().slice(0, 10))
                        : det.semaine,
                    }),
                    (0, $.jsx)(AbsTuile, {
                      label: `Heures normales`,
                      valeur: (det.heures_normales || 0) + ` h`,
                    }),
                    (0, $.jsx)(AbsTuile, {
                      label: `Heures supp.`,
                      valeur: (det.heures_supp || 0) + ` h`,
                      couleur: `primary.main`,
                    }),
                    (0, $.jsx)(AbsTuile, {
                      label: `Tranche`,
                      valeur: (HS_TRANCHES[det.tranche] ||
                        HS_TRANCHES.jour)[0].split(` (`)[0],
                    }),
                    (0, $.jsx)(AbsTuile, {
                      label: `Taux appliqué`,
                      valeur: det.taux_majoration,
                    }),
                    (0, $.jsx)(AbsTuile, {
                      label: `Montant`,
                      valeur: sldFCFA(det.montant_calcule || 0),
                      couleur: `primary.main`,
                    }),
                  ],
                })
              : null,
            det
              ? (0, $.jsxs)(a, {
                  sx: { display: `flex`, flexDirection: `column`, gap: 0.75 },
                  children: [
                    (0, $.jsx)(i, {
                      variant: `subtitle2`,
                      sx: { fontWeight: 800 },
                      children: `Plafonds réglementaires — décret n° 93/184`,
                    }),
                    (0, $.jsxs)(a, {
                      sx: { display: `flex`, alignItems: `center`, gap: 1 },
                      children: [
                        (0, $.jsx)(i, {
                          variant: `caption`,
                          sx: {
                            width: 150,
                            color: `text.secondary`,
                            fontWeight: 700,
                          },
                          children: `Semaine (` + mt.quotaHebdo + ` h max)`,
                        }),
                        (0, $.jsx)(a, {
                          sx: {
                            flex: 1,
                            height: 9,
                            borderRadius: 5,
                            bgcolor: `action.hover`,
                            overflow: `hidden`,
                          },
                          children: (0, $.jsx)(a, {
                            sx: {
                              width: det.plafSem.pct + `%`,
                              height: `100%`,
                              bgcolor:
                                det.plafSem.etat === `fin`
                                  ? `error.main`
                                  : det.plafSem.etat === `proche`
                                    ? `warning.main`
                                    : `success.main`,
                            },
                          }),
                        }),
                        (0, $.jsx)(i, {
                          variant: `caption`,
                          fontWeight: 800,
                          children: det.plafSem.pris + ` h`,
                        }),
                      ],
                    }),
                    (0, $.jsxs)(a, {
                      sx: { display: `flex`, alignItems: `center`, gap: 1 },
                      children: [
                        (0, $.jsx)(i, {
                          variant: `caption`,
                          sx: {
                            width: 150,
                            color: `text.secondary`,
                            fontWeight: 700,
                          },
                          children: `Annuel (` + mt.quotaAn + ` h max)`,
                        }),
                        (0, $.jsx)(a, {
                          sx: {
                            flex: 1,
                            height: 9,
                            borderRadius: 5,
                            bgcolor: `action.hover`,
                            overflow: `hidden`,
                          },
                          children: (0, $.jsx)(a, {
                            sx: {
                              width: det.plafAn.pct + `%`,
                              height: `100%`,
                              bgcolor:
                                det.plafAn.etat === `fin`
                                  ? `error.main`
                                  : det.plafAn.etat === `proche`
                                    ? `warning.main`
                                    : `success.main`,
                            },
                          }),
                        }),
                        (0, $.jsx)(i, {
                          variant: `caption`,
                          fontWeight: 800,
                          children: det.plafAn.pris + ` h`,
                        }),
                      ],
                    }),
                    det.plafSem.etat !== `ok`
                      ? (0, $.jsx)(i, {
                          variant: `caption`,
                          sx: { color: `error.main`, fontWeight: 700 },
                          children: `Plafond hebdomadaire dépassé pour cette semaine — régularisation ou repos compensateur requis.`,
                        })
                      : det.plafAn.etat !== `ok`
                        ? (0, $.jsx)(i, {
                            variant: `caption`,
                            sx: { color: `warning.main`, fontWeight: 700 },
                            children: `≥ 80 % du quota annuel consommé — anticiper la fin de droits.`,
                          })
                        : null,
                    det.tauxBas || det.ecart
                      ? (0, $.jsx)(i, {
                          variant: `caption`,
                          sx: { color: `warning.main`, fontWeight: 700 },
                          children:
                            (det.tauxBas
                              ? `Taux déclaré ` +
                                det.tauxNum +
                                ` % < majoration légale ` +
                                det.mjLegal +
                                ` % pour la tranche « ` +
                                (HS_TRANCHES[det.tranche] ||
                                  HS_TRANCHES.jour)[0] +
                                ` ». `
                              : ``) +
                            (det.ecart
                              ? `Montant déclaré ` +
                                sldFCFA(det.montant_calcule || 0) +
                                ` ≠ recalcul au taux horaire contractuel ` +
                                sldFCFA(det.attendu) +
                                `.`
                              : ``),
                        })
                      : null,
                  ],
                })
              : null,
            det
              ? (0, $.jsxs)(a, {
                  sx: { display: `flex`, flexDirection: `column`, gap: 0.4 },
                  children: [
                    (0, $.jsx)(i, {
                      variant: `subtitle2`,
                      sx: { fontWeight: 800, mt: 0.5 },
                      children: `Historique`,
                    }),
                    (0, $.jsx)(i, {
                      variant: `caption`,
                      children:
                        `Déclarée le ` +
                        (det.date_decl ? A(det.date_decl) : `—`) +
                        ` · source : ` +
                        (det.source === `v2`
                          ? `saisie RH`
                          : det.source === `sim`
                            ? `historique`
                            : `base`),
                    }),
                    (0, $.jsx)(i, {
                      variant: `caption`,
                      children:
                        `Validation : ` +
                        (det.valide_par && R(det.valide_par)
                          ? B(R(det.valide_par)) +
                            (det.valide_le ? ` le ` + A(det.valide_le) : ``)
                          : `en attente de décision manager`),
                    }),
                    det.paie_lot
                      ? (0, $.jsx)(i, {
                          variant: `caption`,
                          children: `Intégrée au lot paie ` + det.paie_lot,
                        })
                      : null,
                    det.motif
                      ? (0, $.jsx)(i, {
                          variant: `caption`,
                          children: `Motif : ` + det.motif,
                        })
                      : null,
                    det.motif_rejet
                      ? (0, $.jsx)(i, {
                          variant: `caption`,
                          sx: { color: `error.main`, fontWeight: 700 },
                          children: `Motif du rejet : ` + det.motif_rejet,
                        })
                      : null,
                  ],
                })
              : null,
          ],
        }),
        (0, $.jsxs)(m, {
          sx: { px: 3, pb: 2 },
          children: [
            (0, $.jsx)(l, {
              onClick: () => setDetail(null),
              children: `Fermer`,
            }),
            det && det.statut === `en_attente`
              ? (0, $.jsxs)(a, {
                  sx: { display: `flex`, gap: 1 },
                  children: [
                    (0, $.jsx)(l, {
                      size: `small`,
                      onClick: () => {
                        (setDlgRej(det), setDetail(null));
                      },
                      sx: {
                        textTransform: `none`,
                        fontSize: `0.72rem`,
                        color: `error.main`,
                      },
                      children: `Rejeter`,
                    }),
                    (0, $.jsx)(l, {
                      variant: `contained`,
                      size: `small`,
                      onClick: () => {
                        (fValide(det), setDetail(null));
                      },
                      sx: {
                        textTransform: `none`,
                        fontSize: `0.72rem`,
                        bgcolor: `#7e3ff2`,
                      },
                      children: `Valider`,
                    }),
                  ],
                })
              : null,
          ],
        }),
      ],
    });
  var hsDlgNew = () =>
    (0, $.jsxs)(f, {
      open: dlgNew,
      onClose: () => setDlgNew(!1),
      maxWidth: `sm`,
      fullWidth: !0,
      children: [
        (0, $.jsx)(h, {
          sx: { fontWeight: 800 },
          children: `Déclarer des heures supplémentaires`,
        }),
        (0, $.jsxs)(p, {
          sx: { display: `flex`, flexDirection: `column`, gap: 2 },
          children: [
            (0, $.jsx)(c, {
              severity: `info`,
              children: `La déclaration démarre « En attente » — validation manager OBLIGATOIRE avant intégration paie (art. 90 CT). Le taux de majoration légale de la tranche est appliqué automatiquement (décret n° 93/184).`,
            }),
            (0, $.jsxs)(D, {
              select: !0,
              size: `small`,
              label: `Employé`,
              value: empNew,
              onChange: (e2) => setEmpNew(e2.target.value),
              sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
              children: [
                (0, $.jsx)(s, {
                  value: ``,
                  children: `— Choisir un employé —`,
                }),
                H.map((e3) =>
                  (0, $.jsx)(
                    s,
                    {
                      value: e3.id,
                      children: B(e3) + ` · ` + (e3.departement || ``),
                    },
                    e3.id,
                  ),
                ),
              ],
            }),
            (0, $.jsxs)(a, {
              sx: { display: `grid`, gridTemplateColumns: `1fr 1fr`, gap: 2 },
              children: [
                (0, $.jsxs)(D, {
                  select: !0,
                  size: `small`,
                  label: `Semaine`,
                  value: semNew,
                  onChange: (e2) => setSemNew(e2.target.value),
                  sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                  children: hsSemOptions.map((sk) =>
                    (0, $.jsx)(s, { value: sk, children: sk }, sk),
                  ),
                }),
                (0, $.jsx)(D, {
                  type: `number`,
                  size: `small`,
                  label: `Heures normales`,
                  value: hnNew,
                  onChange: (e2) => setHnNew(e2.target.value),
                  sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                }),
              ],
            }),
            (0, $.jsxs)(a, {
              sx: { display: `grid`, gridTemplateColumns: `1fr 1fr`, gap: 2 },
              children: [
                (0, $.jsx)(D, {
                  type: `number`,
                  size: `small`,
                  label: `Heures supplémentaires`,
                  value: hNew,
                  onChange: (e2) => setHNew(e2.target.value),
                  sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                }),
                (0, $.jsxs)(D, {
                  select: !0,
                  size: `small`,
                  label: `Tranche`,
                  value: trNew,
                  onChange: (e2) => setTrNew(e2.target.value),
                  sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                  children: Object.keys(HS_TRANCHES)
                    .filter((tk) => tk !== `feries`)
                    .map((tk) =>
                      (0, $.jsx)(
                        s,
                        { value: tk, children: HS_TRANCHES[tk][0] },
                        tk,
                      ),
                    ),
                }),
              ],
            }),
            hNew && parseInt(hNew, 10) > 0
              ? (0, $.jsx)(i, {
                  variant: `caption`,
                  sx: { color: `text.secondary` },
                  children:
                    mt.modeCalc === `prog` && (trNew || `jour`) === `jour`
                      ? `Taux progressif (` +
                        hsBrkLbl(mt) +
                        `) · Montant estimé : ` +
                        sldFCFA(
                          hsCalcRow(
                            parseInt(hNew, 10),
                            hsTauxHoraire(R(empNew), mt),
                            trNew,
                            mt,
                            hsPosSem(empNew, semNew),
                          ).montant,
                        )
                      : `Taux appliqué : ` +
                        (100 + hsMjTranche(trNew, mt)) +
                        ` % · Montant estimé : ` +
                        sldFCFA(
                          parseInt(hNew, 10) *
                            hsTauxHoraire(R(empNew), mt) *
                            ((100 + hsMjTranche(trNew, mt)) / 100),
                        ),
                })
              : null,
            (0, $.jsx)(D, {
              size: `small`,
              label: `Motif (facultatif)`,
              value: motifNew,
              onChange: (e2) => setMotifNew(e2.target.value),
              sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
            }),
          ],
        }),
        (0, $.jsxs)(m, {
          sx: { px: 3, pb: 2 },
          children: [
            (0, $.jsx)(l, {
              onClick: () => setDlgNew(!1),
              children: `Annuler`,
            }),
            (0, $.jsx)(l, {
              variant: `contained`,
              onClick: fNew,
              sx: { bgcolor: `#7e3ff2`, textTransform: `none` },
              children: `Enregistrer la déclaration`,
            }),
          ],
        }),
      ],
    });
  var hsDlgRej = () =>
    (0, $.jsxs)(f, {
      open: !!dlgRej,
      onClose: () => setDlgRej(null),
      maxWidth: `xs`,
      fullWidth: !0,
      children: [
        (0, $.jsx)(h, {
          sx: { fontWeight: 800 },
          children: dlgRej
            ? `Rejeter la déclaration — ` +
              B(dlgRej.emp) +
              ` (` +
              dlgRej.semaine +
              `)`
            : `Rejeter`,
        }),
        (0, $.jsxs)(p, {
          sx: { display: `flex`, flexDirection: `column`, gap: 2 },
          children: [
            (0, $.jsx)(c, {
              severity: `warning`,
              children: `Le rejet est notifié au salarié et doit être motivé — aucune heure rejetée n'est intégrée à la paie.`,
            }),
            (0, $.jsx)(D, {
              size: `small`,
              label: `Motif du rejet`,
              value: motRej,
              onChange: (e2) => setMotRej(e2.target.value),
              sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
            }),
          ],
        }),
        (0, $.jsxs)(m, {
          sx: { px: 3, pb: 2 },
          children: [
            (0, $.jsx)(l, {
              onClick: () => setDlgRej(null),
              children: `Annuler`,
            }),
            (0, $.jsx)(l, {
              variant: `contained`,
              color: `error`,
              onClick: fRejeteConf,
              sx: { textTransform: `none` },
              children: `Confirmer le rejet`,
            }),
          ],
        }),
      ],
    });
  var hsDlgPar = () =>
    (0, $.jsxs)(f, {
      open: dlgPar,
      onClose: () => setDlgPar(!1),
      maxWidth: `sm`,
      fullWidth: !0,
      children: [
        (0, $.jsx)(h, {
          sx: { fontWeight: 800 },
          children: `Paramètres — plafonds & majorations`,
        }),
        (0, $.jsxs)(p, {
          sx: { display: `flex`, flexDirection: `column`, gap: 2 },
          children: [
            (0, $.jsx)(c, {
              severity: `info`,
              children: `Conformité Code du travail Cameroun : durée légale 40 h/semaine (art. 90 CT), plafond usuel 20 h supplémentaires/semaine et majorations minimales du décret n° 93/184 (jour +20 à +40 % selon la tranche hebdomadaire (décret n° 93/184), nuit +50 %, dimanche & férié non chômé +40 %). Adaptez selon votre convention collective.`,
            }),
            (0, $.jsxs)(a, {
              sx: { display: `grid`, gridTemplateColumns: `1fr 1fr`, gap: 2 },
              children: [
                (0, $.jsx)(D, {
                  type: `number`,
                  size: `small`,
                  label: `Plafond HS / semaine (h)`,
                  value: pQuotaH,
                  onChange: (e2) => setParQH(e2.target.value),
                  sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                }),
                (0, $.jsx)(D, {
                  type: `number`,
                  size: `small`,
                  label: `Quota HS / an (h)`,
                  value: pQuotaA,
                  onChange: (e2) => setParQA(e2.target.value),
                  sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                }),
                (0, $.jsx)(D, {
                  type: `number`,
                  size: `small`,
                  label: `Majoration jour (%)`,
                  value: pMjJ,
                  onChange: (e2) => setParMJ(e2.target.value),
                  sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                }),
                (0, $.jsx)(D, {
                  type: `number`,
                  size: `small`,
                  label: `Majoration nuit (%)`,
                  value: pMjN,
                  onChange: (e2) => setParMN(e2.target.value),
                  sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                }),
                (0, $.jsx)(D, {
                  type: `number`,
                  size: `small`,
                  label: `Majoration dimanche & férié (%)`,
                  value: pMjF,
                  onChange: (e2) => setParMF(e2.target.value),
                  sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                }),
                (0, $.jsx)(D, {
                  type: `number`,
                  size: `small`,
                  label: `Seuil surcharge 4 semaines (h)`,
                  value: pS4,
                  onChange: (e2) => setParS4(e2.target.value),
                  sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                }),
                (0, $.jsx)(D, {
                  type: `number`,
                  size: `small`,
                  label: `Taux horaire par défaut (FCFA)`,
                  value: pTd,
                  onChange: (e2) => setParTd(e2.target.value),
                  sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                }),
              ],
            }),
          ],
        }),
        (0, $.jsxs)(m, {
          sx: { px: 3, pb: 2 },
          children: [
            (0, $.jsx)(l, {
              onClick: () => setDlgPar(!1),
              children: `Annuler`,
            }),
            (0, $.jsx)(l, {
              variant: `contained`,
              onClick: fSavePar,
              sx: { bgcolor: `#7e3ff2`, textTransform: `none` },
              children: `Enregistrer les paramètres`,
            }),
          ],
        }),
      ],
    });
  var det = detail ? ALL.find((r) => r.id === detail) : null;
  var alRetard = ALL.filter((r) => r.retard);
  var alPlaf = ALL.filter((r) => r.plafSem.etat === `fin`).filter(
    (r, ix, arr) =>
      arr.findIndex(
        (x2) => x2.employee_id === r.employee_id && x2.semaine === r.semaine,
      ) === ix,
  );
  var selCount = Object.keys(sel).length;
  var fToggle = (r) => {
    if (r.statut !== `en_attente`) return;
    setSel((s2) => {
      var c2 = Object.assign({}, s2);
      if (c2[r.id]) delete c2[r.id];
      else c2[r.id] = 1;
      return c2;
    });
  };
  var hsSemOptions = (0, Q.useMemo)(() => {
    var out = [];
    for (var off = -2; off <= 1; off++) {
      var idx = hsCur.an * 53 + hsCur.num + off;
      var yy = Math.floor((idx - 1) / 53);
      var nn = idx - yy * 53;
      var an2 = yy;
      var n3 = nn;
      if (nn < 1) {
        an2 -= 1;
        n3 = nn + 52;
      }
      out.push(`S` + n3 + `-` + an2);
    }
    return out;
  }, []);
  /* — Vue RH / Manager : cockpit heures supplémentaires — */
  return (0, $.jsxs)(o, {
    spacing: 2.5,
    sx: { width: `100%`, maxWidth: `100%`, minWidth: 0 },
    children: [
      (0, $.jsx)(J, {
        title: `Heures supplémentaires — Cockpit validation & intégration paie`,
        subtitle:
          `Exercice ` +
          an +
          ` · ` +
          allAn.length +
          ` déclaration(s) · Workflow manager obligatoire avant paie (art. 90 CT) · Majorations décret n° 93/184`,
        action: (0, $.jsxs)(o, {
          direction: `row`,
          spacing: 1,
          children: [
            (0, $.jsx)(l, {
              variant: `outlined`,
              size: `small`,
              startIcon: (0, $.jsx)(RF, {}),
              onClick: () => {
                (setTick(tick + 1),
                  setSnack({
                    msg: `Données recalculées — seed + historique + déclarations locales.`,
                    sev: `success`,
                  }));
              },
              sx: { textTransform: `none`, fontSize: `0.72rem` },
              children: `Recalculer`,
            }),
            (0, $.jsx)(l, {
              variant: `outlined`,
              size: `small`,
              startIcon: (0, $.jsx)(AT, {}),
              onClick: fOpenTaux,
              sx: {
                textTransform: `none`,
                fontSize: `0.72rem`,
                borderColor: `#7e3ff2`,
                color: `#7e3ff2`,
              },
              children: `Configurateur de taux`,
            }),
            (0, $.jsx)(l, {
              variant: `outlined`,
              size: `small`,
              startIcon: (0, $.jsx)(TUNE, {}),
              onClick: fOpenPar,
              sx: { textTransform: `none`, fontSize: `0.72rem` },
              children: `Paramètres`,
            }),
            (0, $.jsx)(l, {
              variant: `outlined`,
              size: `small`,
              startIcon: (0, $.jsx)(S, {}),
              onClick: fExport,
              sx: { textTransform: `none`, fontSize: `0.72rem` },
              children: `Export CSV`,
            }),
            (0, $.jsx)(l, {
              variant: `contained`,
              size: `small`,
              startIcon: (0, $.jsx)(x, {}),
              onClick: () => setDlgNew(!0),
              sx: {
                textTransform: `none`,
                fontSize: `0.72rem`,
                bgcolor: `#7e3ff2`,
              },
              children: `Déclarer`,
            }),
          ],
        }),
      }),
      alRetard.length > 0 || alPlaf.length > 0
        ? (0, $.jsx)(c, {
            severity: alPlaf.length > 0 ? `error` : `warning`,
            icon: (0, $.jsx)(w, {}),
            sx: { fontWeight: 600 },
            children:
              (alPlaf.length > 0
                ? alPlaf.length +
                  ` dépassement(s) du plafond de ` +
                  mt.quotaHebdo +
                  ` h/semaine (décret n° 93/184) — ` +
                  Array.from(
                    new Set(
                      alPlaf.map(
                        (r) =>
                          B(r.emp) +
                          ` (` +
                          r.plafSem.pris +
                          ` h, ` +
                          r.semaine +
                          `)`,
                      ),
                    ),
                  )
                    .slice(0, 3)
                    .join(` · `) +
                  (alPlaf.length > 3 ? `…` : ``) +
                  `. `
                : ``) +
              (alRetard.length > 0
                ? alRetard.length +
                  ` déclaration(s) en attente de validation depuis plus de 5 jours — action manager requise avant intégration paie.`
                : ``),
          })
        : null,
      (0, $.jsxs)(a, {
        sx: {
          display: `grid`,
          gridTemplateColumns: { xs: `1fr 1fr`, md: `repeat(4,1fr)` },
          gap: 1.5,
        },
        children: [
          (0, $.jsx)(AbsKpi, {
            ic: AT,
            grad: statutF === `tous` && moisF !== `tous`,
            actif: moisF !== `tous`,
            onClic: () => {
              (setMoisF(moisF === kpiMois.mois ? `tous` : kpiMois.mois),
                setPage(0));
            },
            valeur: kpiMois.h + ` h`,
            label: `HS du mois ` + hsMoisLabel(parseInt(kpiMois.mois, 10)),
            sub:
              sldFCFA(kpiMois.fc) +
              ` · ` +
              kpiMois.n +
              ` déclaration(s) · cliquez pour filtrer`,
          }),
          (0, $.jsx)(AbsKpi, {
            ic: HEA,
            actif: statutF === `en_attente`,
            couleur: kpiAtt.n > 0 ? `warning.main` : `success.main`,
            onClic: () => {
              (setStatutF(statutF === `en_attente` ? `tous` : `en_attente`),
                setPage(0));
            },
            valeur: String(kpiAtt.n),
            label: `En attente de validation`,
            sub:
              kpiAtt.n > 0
                ? kpiAtt.h + ` h · ` + sldFCFA(kpiAtt.fc) + ` à arbitrer`
                : `Tout est traité`,
          }),
          (0, $.jsx)(AbsKpi, {
            ic: PYC,
            actif: !1,
            onClic: () => {
              (setAn(hsAnAuto(hsToutes())),
                setStatutF(`tous`),
                setMoisF(`tous`),
                setPage(0));
            },
            valeur: sldFCFA(kpiCout.fc),
            label: `Coût engagé ` + an,
            sub: kpiCout.h + ` h validées / payées`,
          }),
          (0, $.jsx)(AbsKpi, {
            ic: AB,
            actif: statutF === `surcharge`,
            couleur: kpiSur > 0 ? `error.main` : `success.main`,
            onClic: () => {
              (setStatutF(statutF === `surcharge` ? `tous` : `surcharge`),
                setPage(0));
            },
            valeur: String(kpiSur),
            label: `Surcharge 4 semaines`,
            sub:
              kpiSur > 0
                ? `> ` + mt.seuilS4 + ` h glissantes — risque de sous-effectif`
                : `Charge normale`,
          }),
        ],
      }),
      (0, $.jsx)(ee, {
        sx: { p: 1.5, borderRadius: 3 },
        children: (0, $.jsxs)(o, {
          direction: { xs: `column`, md: `row` },
          spacing: 1.2,
          sx: { alignItems: { md: `center` } },
          children: [
            (0, $.jsx)(D, {
              size: `small`,
              placeholder: `Rechercher (nom, matricule, semaine, motif, montant…)`,
              value: rech,
              onChange: (e2) => {
                (setRech(e2.target.value), setPage(0));
              },
              InputProps: {
                startAdornment: (0, $.jsx)(k, {
                  sx: { fontSize: 18, mr: 1, color: `text.secondary` },
                }),
              },
              sx: {
                flex: 2,
                minWidth: 0,
                "& .MuiInput-root": { fontSize: `0.8rem` },
              },
            }),
            (0, $.jsxs)(D, {
              select: !0,
              size: `small`,
              label: `Département`,
              value: dept,
              onChange: (e2) => {
                (setDept(e2.target.value), setPage(0));
              },
              sx: {
                minWidth: 150,
                "& .MuiInput-root": { fontSize: `0.78rem` },
              },
              children: [
                (0, $.jsx)(s, { value: `tous`, children: `Tous départements` }),
                depts.map((d2) =>
                  (0, $.jsx)(s, { value: d2, children: d2 }, d2),
                ),
              ],
            }),
            (0, $.jsxs)(D, {
              select: !0,
              size: `small`,
              label: `Statut / alerte`,
              value: statutF,
              onChange: (e2) => {
                (setStatutF(e2.target.value), setPage(0));
              },
              sx: {
                minWidth: 170,
                "& .MuiInput-root": { fontSize: `0.78rem` },
              },
              children: [
                (0, $.jsx)(s, { value: `tous`, children: `Tous statuts` }),
                (0, $.jsx)(s, {
                  value: `en_attente`,
                  children: `En attente de validation`,
                }),
                (0, $.jsx)(s, { value: `validee`, children: `Validées` }),
                (0, $.jsx)(s, { value: `payee`, children: `Payées` }),
                (0, $.jsx)(s, { value: `rejetee`, children: `Rejetées` }),
                (0, $.jsx)(s, {
                  value: `surcharge`,
                  children: `Surcharge 4 semaines`,
                }),
                (0, $.jsx)(s, {
                  value: `retard`,
                  children: `Retard validation > 5 j`,
                }),
                (0, $.jsx)(s, {
                  value: `plafond`,
                  children: `Plafond semaine atteint`,
                }),
                (0, $.jsx)(s, { value: `ecart`, children: `Écart de montant` }),
                (0, $.jsx)(s, {
                  value: `taux_bas`,
                  children: `Taux < majoration légale`,
                }),
              ],
            }),
            (0, $.jsxs)(D, {
              select: !0,
              size: `small`,
              label: `Exercice`,
              value: an,
              onChange: (e2) => {
                (setAn(e2.target.value), setPage(0));
              },
              sx: {
                minWidth: 110,
                "& .MuiInput-root": { fontSize: `0.78rem` },
              },
              children: [
                (0, $.jsx)(s, { value: `tous`, children: `Tous` }),
                annees.map((a2) =>
                  (0, $.jsx)(s, { value: a2, children: a2 }, a2),
                ),
              ],
            }),
            (0, $.jsxs)(D, {
              select: !0,
              size: `small`,
              label: `Mois`,
              value: moisF,
              onChange: (e2) => {
                (setMoisF(e2.target.value), setPage(0));
              },
              sx: {
                minWidth: 110,
                "& .MuiInput-root": { fontSize: `0.78rem` },
              },
              children: [
                (0, $.jsx)(s, { value: `tous`, children: `Tous` }),
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m2) =>
                  (0, $.jsx)(
                    s,
                    {
                      value: String(m2).padStart(2, `0`),
                      children: hsMoisLabel(m2),
                    },
                    m2,
                  ),
                ),
              ],
            }),
          ],
        }),
      }),
      selCount > 0
        ? (0, $.jsx)(ee, {
            sx: {
              p: 1.2,
              borderRadius: 2,
              border: `1px solid #7e3ff2`,
              bgcolor: `rgba(126,63,242,.04)`,
              display: `flex`,
              alignItems: `center`,
              gap: 1.5,
              flexWrap: `wrap`,
            },
            children: [
              (0, $.jsx)(i, {
                variant: `body2`,
                fontWeight: 700,
                children:
                  selCount +
                  ` déclaration(s) sélectionnée(s) — clic sur une ligne pour sélectionner/désélectionner`,
              }),
              (0, $.jsx)(l, {
                variant: `contained`,
                size: `small`,
                onClick: fValideSel,
                sx: {
                  textTransform: `none`,
                  fontSize: `0.75rem`,
                  bgcolor: `#7e3ff2`,
                },
                children: `Valider la sélection`,
              }),
              (0, $.jsx)(l, {
                size: `small`,
                onClick: () => setSel({}),
                sx: { textTransform: `none`, fontSize: `0.75rem` },
                children: `Annuler`,
              }),
            ],
          })
        : null,
      (0, $.jsx)(y, {
        sx: { borderRadius: 2, border: `1px solid`, borderColor: `divider` },
        children: (0, $.jsxs)(ne, {
          size: `small`,
          stickyHeader: !0,
          sx: { "& .MuiTableCell-root": { fontSize: `0.78rem` } },
          children: [
            (0, $.jsx)(te, {
              children: (0, $.jsxs)(b, {
                sx: { bgcolor: `background.default` },
                children: [
                  fTh(`Employé`, `emp`),
                  fTh(`Semaine`),
                  fTh(`H. norm.`, `hn`, `right`),
                  fTh(`H. supp.`, `hs`, `right`),
                  fTh(`Tranche`),
                  fTh(`Taux`),
                  fTh(`Montant`, `montant`, `right`),
                  fTh(`Plafond semaine`),
                  fTh(`Validé par`),
                  fTh(`Statut`, `statut`),
                  (0, $.jsx)(v, {
                    align: `center`,
                    sx: { fontWeight: 700 },
                    children: `Actions`,
                  }),
                ],
              }),
            }),
            (0, $.jsxs)(_, {
              children: [
                srt.slice(page * pp, page * pp + pp).map((rw) =>
                  (0, $.jsxs)(
                    b,
                    {
                      hover: !0,
                      onClick: () => fToggle(rw),
                      sx: {
                        cursor:
                          rw.statut === `en_attente` ? `pointer` : `default`,
                        bgcolor: sel[rw.id]
                          ? `rgba(126,63,242,.08)`
                          : undefined,
                      },
                      children: [
                        (0, $.jsx)(v, {
                          children: (0, $.jsxs)(a, {
                            sx: {
                              display: `flex`,
                              alignItems: `center`,
                              gap: 1.2,
                            },
                            children: [
                              sldAvatar(rw.emp, 32, 11),
                              (0, $.jsxs)(a, {
                                sx: { minWidth: 0 },
                                children: [
                                  (0, $.jsx)(i, {
                                    variant: `body2`,
                                    fontWeight: 700,
                                    noWrap: !0,
                                    children: rw.emp
                                      ? B(rw.emp)
                                      : rw.employee_id,
                                  }),
                                  (0, $.jsx)(i, {
                                    variant: `caption`,
                                    sx: {
                                      color: `text.secondary`,
                                      fontFamily: `monospace`,
                                    },
                                    children:
                                      (rw.emp && rw.emp.matricule) || `—`,
                                  }),
                                ],
                              }),
                            ],
                          }),
                        }),
                        (0, $.jsxs)(v, {
                          children: [
                            (0, $.jsx)(T, {
                              label: rw.semaine,
                              size: `small`,
                              variant: `outlined`,
                              sx: { fontWeight: 700, fontSize: `0.68rem` },
                            }),
                            (0, $.jsx)(i, {
                              variant: `caption`,
                              sx: { display: `block`, color: `text.secondary` },
                              children: rw.lundi
                                ? `sem. du ` +
                                  A(rw.lundi.toISOString().slice(0, 10))
                                : `—`,
                            }),
                          ],
                        }),
                        (0, $.jsx)(v, {
                          align: `right`,
                          children: (rw.heures_normales || 0) + ` h`,
                        }),
                        (0, $.jsx)(v, {
                          align: `right`,
                          children: (0, $.jsx)(T, {
                            label: (rw.heures_supp || 0) + ` h`,
                            size: `small`,
                            color: `primary`,
                            variant: `outlined`,
                            sx: { fontWeight: 800 },
                          }),
                        }),
                        (0, $.jsx)(v, {
                          children: (0, $.jsx)(T, {
                            label: (HS_TRANCHES[rw.tranche] ||
                              HS_TRANCHES.jour)[0],
                            size: `small`,
                            variant: `outlined`,
                            sx: { fontWeight: 700, fontSize: `0.62rem` },
                          }),
                        }),
                        (0, $.jsxs)(v, {
                          children: [
                            (0, $.jsx)(T, {
                              label: rw.taux_majoration,
                              size: `small`,
                              variant: `outlined`,
                              sx: { fontWeight: 700, fontSize: `0.68rem` },
                            }),
                            rw.tauxBas
                              ? (0, $.jsx)(i, {
                                  variant: `caption`,
                                  sx: {
                                    display: `block`,
                                    color: `errorw.main`,
                                    fontWeight: 700,
                                  },
                                  children: `< légal ` + rw.mjLegal + ` %`,
                                })
                              : null,
                          ],
                        }),
                        (0, $.jsxs)(v, {
                          align: `right`,
                          children: [
                            (0, $.jsx)(i, {
                              variant: `body2`,
                              fontWeight: 800,
                              children: sldFCFA(rw.montant_calcule || 0),
                            }),
                            rw.ecart
                              ? (0, $.jsx)(i, {
                                  variant: `caption`,
                                  sx: {
                                    display: `block`,
                                    color: `warning.main`,
                                    fontWeight: 700,
                                  },
                                  children:
                                    `écart ≠ recalcul ` + sldFCFA(rw.attendu),
                                })
                              : null,
                          ],
                        }),
                        (0, $.jsx)(v, {
                          children: (0, $.jsxs)(a, {
                            sx: { minWidth: 110 },
                            children: [
                              (0, $.jsx)(a, {
                                sx: {
                                  height: 7,
                                  borderRadius: 4,
                                  bgcolor: `action.hover`,
                                  overflow: `hidden`,
                                },
                                children: (0, $.jsx)(a, {
                                  sx: {
                                    width: rw.plafSem.pct + `%`,
                                    height: `100%`,
                                    bgcolor:
                                      rw.plafSem.etat === `fin`
                                        ? `errorw.main`
                                        : rw.plafSem.etat === `proche`
                                          ? `warning.main`
                                          : `success.main`,
                                  },
                                }),
                              }),
                              (0, $.jsx)(i, {
                                variant: `caption`,
                                sx: {
                                  color:
                                    rw.plafSem.etat === `fin`
                                      ? `errorw.main`
                                      : `text.secondary`,
                                  fontWeight: 700,
                                },
                                children:
                                  rw.plafSem.pris +
                                  ` / ` +
                                  rw.plafSem.quota +
                                  ` h`,
                              }),
                            ],
                          }),
                        }),
                        (0, $.jsx)(v, {
                          children:
                            rw.valide_par && R(rw.valide_par)
                              ? B(R(rw.valide_par))
                              : `—`,
                        }),
                        (0, $.jsxs)(v, {
                          children: [
                            (0, $.jsx)(q, {
                              status: rw.statut,
                              label: (HS_ST[rw.statut] || [rw.statut])[0],
                            }),
                            (0, $.jsxs)(a, {
                              sx: {
                                display: `flex`,
                                gap: 0.4,
                                flexWrap: `wrap`,
                                mt: 0.4,
                              },
                              children: [
                                rw.retard
                                  ? (0, $.jsx)(T, {
                                      label: `Retard > 5 j`,
                                      size: `small`,
                                      color: `warning`,
                                      variant: `filled`,
                                      sx: {
                                        fontWeight: 800,
                                        fontSize: `0.58rem`,
                                      },
                                    })
                                  : null,
                                rw.surcharge
                                  ? (0, $.jsx)(T, {
                                      label:
                                        `Surcharge ` + rw.s4 + ` h / 4 sem`,
                                      size: `small`,
                                      color: `error`,
                                      variant: `outlined`,
                                      sx: {
                                        fontWeight: 800,
                                        fontSize: `0.58rem`,
                                      },
                                    })
                                  : null,
                                rw.paie_lot
                                  ? (0, $.jsx)(T, {
                                      label: `Lot ` + rw.paie_lot,
                                      size: `small`,
                                      color: `info`,
                                      variant: `outlined`,
                                      sx: {
                                        fontWeight: 800,
                                        fontSize: `0.58rem`,
                                      },
                                    })
                                  : null,
                                rw.motif_rejet
                                  ? (0, $.jsx)(T, {
                                      label: `Rejet : ` + rw.motif_rejet,
                                      size: `small`,
                                      variant: `outlined`,
                                      sx: {
                                        fontWeight: 700,
                                        fontSize: `0.58rem`,
                                      },
                                    })
                                  : null,
                              ],
                            }),
                          ],
                        }),
                        (0, $.jsx)(v, {
                          align: `center`,
                          children: (0, $.jsxs)(o, {
                            direction: `row`,
                            spacing: 0.5,
                            justifyContent: `center`,
                            alignItems: `center`,
                            children: [
                              (0, $.jsx)(E, {
                                title: `Fiche détaillée`,
                                children: (0, $.jsx)(r, {
                                  size: `small`,
                                  onClick: () => setDetail(rw.id),
                                  children: (0, $.jsx)(C, {
                                    fontSize: `small`,
                                  }),
                                }),
                              }),
                              rw.statut === `en_attente`
                                ? (0, $.jsx)(l, {
                                    variant: `outlined`,
                                    size: `small`,
                                    onClick: () => fValide(rw),
                                    sx: {
                                      textTransform: `none`,
                                      fontSize: `0.68rem`,
                                      color: `success.main`,
                                      borderColor: `success.main`,
                                      minWidth: 0,
                                      px: 1,
                                    },
                                    children: `Valider`,
                                  })
                                : null,
                              rw.statut === `en_attente`
                                ? (0, $.jsx)(l, {
                                    size: `small`,
                                    onClick: () => setDlgRej(rw),
                                    sx: {
                                      textTransform: `none`,
                                      fontSize: `0.68rem`,
                                      color: `errorw.main`,
                                      minWidth: 0,
                                      px: 1,
                                    },
                                    children: `Rejeter`,
                                  })
                                : null,
                            ],
                          }),
                        }),
                      ],
                    },
                    rw.id,
                  ),
                ),
                srt.length === 0
                  ? (0, $.jsx)(b, {
                      children: (0, $.jsx)(v, {
                        colSpan: 11,
                        align: `center`,
                        sx: { py: 4, color: `text.secondary` },
                        children: `Aucune déclaration ne correspond aux filtres`,
                      }),
                    })
                  : null,
              ],
            }),
          ],
        }),
      }),
      (0, $.jsx)(g, {
        component: `div`,
        count: srt.length,
        page: page,
        onPageChange: (e2, v2) => setPage(v2),
        rowsPerPage: pp,
        onRowsPerPageChange: (e2) => {
          (setPp(parseInt(e2.target.value, 10)), setPage(0));
        },
        rowsPerPageOptions: [10, 20, 50],
        labelRowsPerPage: `Lignes :`,
        labelDisplayedRows: (pg2) =>
          pg2.from + `-` + pg2.to + ` sur ` + pg2.count,
        sx: { mt: -1 },
      }),
      (0, $.jsx)(ee, {
        sx: { borderRadius: 3 },
        children: (0, $.jsxs)(u, {
          children: [
            (0, $.jsxs)(a, {
              sx: {
                display: `flex`,
                alignItems: `center`,
                gap: 1,
                mb: 1.5,
                flexWrap: `wrap`,
              },
              children: [
                (0, $.jsx)(PYC, { sx: { fontSize: 20, color: `#7e3ff2` } }),
                (0, $.jsx)(i, {
                  variant: `subtitle2`,
                  fontWeight: 800,
                  children: `Intégration paie — lot mensuel`,
                }),
                (0, $.jsx)(a, {
                  sx: {
                    ml: `auto`,
                    display: `flex`,
                    alignItems: `center`,
                    gap: 1,
                  },
                  children: [
                    (0, $.jsxs)(D, {
                      select: !0,
                      size: `small`,
                      label: `Mois paie`,
                      value: paieMois,
                      onChange: (e2) => setPaieMois(e2.target.value),
                      sx: {
                        minWidth: 120,
                        "& .MuiInput-root": { fontSize: `0.78rem` },
                      },
                      children: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(
                        (m2) =>
                          (0, $.jsx)(
                            s,
                            {
                              value: String(m2).padStart(2, `0`),
                              children: hsMoisLabel(m2) + ` ` + an,
                            },
                            m2,
                          ),
                      ),
                    }),
                    (0, $.jsx)(l, {
                      variant: `contained`,
                      size: `small`,
                      startIcon: (0, $.jsx)(RCPT, {}),
                      disabled: paiePretes.length === 0,
                      onClick: fLot,
                      sx: {
                        textTransform: `none`,
                        fontSize: `0.72rem`,
                        bgcolor: `#7e3ff2`,
                      },
                      children: `Générer le lot paie`,
                    }),
                  ],
                }),
              ],
            }),
            (0, $.jsxs)(a, {
              sx: {
                display: `grid`,
                gridTemplateColumns: { xs: `1fr 1fr`, sm: `repeat(4,1fr)` },
                gap: 1.5,
                mb: paiePretes.length || paieLot.length ? 1.5 : 0,
              },
              children: [
                (0, $.jsx)(AbsTuile, {
                  label: `Validées prêtes (hors lot)`,
                  valeur: paiePretes.length + ` · ` + sldFCFA(paiePretesFc),
                  couleur: paiePretes.length ? `warning.main` : `text.primary`,
                }),
                (0, $.jsx)(AbsTuile, {
                  label: `Incluses au lot ` + paieMois + `-` + an,
                  valeur: paieLot.length + ` · ` + sldFCFA(paieLotFc),
                }),
                (0, $.jsx)(AbsTuile, {
                  label: `Payées sur le mois`,
                  valeur: paiePayees.length + ` · ` + sldFCFA(paiePayeesFc),
                  couleur: `success.main`,
                }),
                (0, $.jsx)(AbsTuile, {
                  label: `Volume HS du mois`,
                  valeur:
                    rowsPaie.reduce(
                      (s2, r) =>
                        s2 + (r.statut === `rejetee` ? 0 : r.heures_supp || 0),
                      0,
                    ) + ` h`,
                }),
              ],
            }),
            paiePretes.length || paieLot.length
              ? (0, $.jsx)(a, {
                  sx: { display: `flex`, flexDirection: `column`, gap: 0.6 },
                  children: rowsPaie
                    .filter((r) => r.statut === `validee`)
                    .slice(0, 6)
                    .map((r) =>
                      (0, $.jsxs)(
                        a,
                        {
                          sx: {
                            display: `flex`,
                            alignItems: `center`,
                            gap: 1,
                            p: 0.6,
                            borderRadius: 1,
                            bgcolor: `background.default`,
                          },
                          children: [
                            (0, $.jsx)(i, {
                              variant: `caption`,
                              fontWeight: 700,
                              sx: {
                                width: 200,
                                overflow: `hidden`,
                                textOverflow: `ellipsis`,
                                whiteSpace: `nowrap`,
                              },
                              children: B(r.emp),
                            }),
                            (0, $.jsx)(T, {
                              label: r.semaine,
                              size: `small`,
                              variant: `outlined`,
                              sx: { fontWeight: 700, fontSize: `0.62rem` },
                            }),
                            (0, $.jsx)(i, {
                              variant: `caption`,
                              children:
                                r.heures_supp + ` h · ` + r.taux_majoration,
                            }),
                            (0, $.jsx)(i, {
                              variant: `caption`,
                              fontWeight: 800,
                              sx: { ml: `auto` },
                              children: sldFCFA(r.montant_calcule || 0),
                            }),
                            r.paie_lot
                              ? (0, $.jsx)(T, {
                                  label: `Lot ` + r.paie_lot,
                                  size: `small`,
                                  color: `info`,
                                  variant: `outlined`,
                                  sx: { fontWeight: 800, fontSize: `0.58rem` },
                                })
                              : (0, $.jsx)(T, {
                                  label: `Prête`,
                                  size: `small`,
                                  color: `warning`,
                                  variant: `outlined`,
                                  sx: { fontWeight: 800, fontSize: `0.58rem` },
                                }),
                          ],
                        },
                        r.id,
                      ),
                    ),
                })
              : (0, $.jsx)(i, {
                  variant: `caption`,
                  sx: { color: `text.secondary` },
                  children: `Aucune heure validée ce mois — validez les déclarations ci-dessus pour préparer le lot paie.`,
                }),
          ],
        }),
      }),
      (0, $.jsx)(ee, {
        sx: { borderRadius: 3 },
        children: (0, $.jsxs)(u, {
          children: [
            (0, $.jsxs)(a, {
              sx: {
                display: `flex`,
                alignItems: `center`,
                gap: 1,
                mb: chOpen ? 1.5 : 0,
              },
              children: [
                (0, $.jsx)(AS2, { sx: { fontSize: 20, color: `#7e3ff2` } }),
                (0, $.jsx)(i, {
                  variant: `subtitle2`,
                  fontWeight: 800,
                  children: `Pilotage visuel`,
                }),
                (0, $.jsx)(a, {
                  sx: {
                    ml: `auto`,
                    display: `flex`,
                    alignItems: `center`,
                    gap: 1,
                  },
                  children: [
                    (0, $.jsx)(T, {
                      label:
                        (hsDD.d > 0 ? `▲ +` : hsDD.d < 0 ? `▼ ` : `= `) +
                        Math.abs(hsDD.d) +
                        ` h vs ` +
                        (parseInt(an, 10) - 1),
                      size: `small`,
                      color:
                        hsDD.d > 0
                          ? `error`
                          : hsDD.d < 0
                            ? `success`
                            : `default`,
                      variant: `outlined`,
                      sx: { fontWeight: 800, fontSize: `0.68rem` },
                    }),
                    (0, $.jsx)(l, {
                      size: `small`,
                      onClick: () => setCh(chOpen ? 0 : 1),
                      sx: {
                        textTransform: `none`,
                        fontSize: `0.72rem`,
                        minWidth: 0,
                      },
                      children: chOpen ? `Masquer` : `Afficher`,
                    }),
                  ],
                }),
              ],
            }),
            chOpen
              ? (0, $.jsxs)(a, {
                  sx: {
                    display: `grid`,
                    gridTemplateColumns: { xs: `1fr`, md: `1fr 1fr` },
                    gap: 2.5,
                    overflowX: `auto`,
                  },
                  children: [
                    (0, $.jsxs)(a, {
                      children: [
                        (0, $.jsx)(i, {
                          variant: `caption`,
                          fontWeight: 800,
                          sx: {
                            color: `text.secondary`,
                            display: `block`,
                            mb: 1,
                          },
                          children:
                            `Répartition des déclarations — ` +
                            srt.length +
                            ` affichée(s)`,
                        }),
                        (0, $.jsx)(a, {
                          sx: {
                            display: `flex`,
                            flexDirection: `column`,
                            gap: 1,
                          },
                          children: [
                            {
                              k: `en_attente`,
                              l: `En attente`,
                              c: `warning.main`,
                              n: chSt.en_attente,
                            },
                            {
                              k: `validee`,
                              l: `Validée`,
                              c: `success.main`,
                              n: chSt.validee,
                            },
                            {
                              k: `payee`,
                              l: `Payée`,
                              c: `info.main`,
                              n: chSt.payee,
                            },
                            {
                              k: `rejetee`,
                              l: `Rejetée`,
                              c: `text.disabled`,
                              n: chSt.rejetee,
                            },
                          ].map((x2) =>
                            (0, $.jsxs)(
                              a,
                              {
                                sx: {
                                  display: `flex`,
                                  alignItems: `center`,
                                  gap: 1,
                                },
                                children: [
                                  (0, $.jsx)(a, {
                                    sx: { width: 92, flexShrink: 0 },
                                    children: (0, $.jsx)(i, {
                                      variant: `caption`,
                                      fontWeight: 700,
                                      children: x2.l,
                                    }),
                                  }),
                                  (0, $.jsx)(a, {
                                    sx: {
                                      flex: 1,
                                      height: 10,
                                      borderRadius: 5,
                                      bgcolor: `action.hover`,
                                      overflow: `hidden`,
                                    },
                                    children: (0, $.jsx)(a, {
                                      sx: {
                                        width:
                                          (srt.length
                                            ? Math.round(
                                                (x2.n / srt.length) * 100,
                                              )
                                            : 0) + `%`,
                                        height: `100%`,
                                        bgcolor: x2.c,
                                      },
                                    }),
                                  }),
                                  (0, $.jsx)(i, {
                                    variant: `caption`,
                                    fontWeight: 800,
                                    sx: { width: 22, textAlign: `right` },
                                    children: String(x2.n),
                                  }),
                                ],
                              },
                              x2.k,
                            ),
                          ),
                        }),
                        (0, $.jsx)(i, {
                          variant: `caption`,
                          fontWeight: 800,
                          sx: {
                            color: `text.secondary`,
                            display: `block`,
                            mb: 1,
                            mt: 2,
                          },
                          children:
                            `Évolution mensuelle ` +
                            (an === `tous` ? new Date().getFullYear() : an) +
                            ` — heures supplémentaires`,
                        }),
                        (0, $.jsx)(a, {
                          sx: {
                            display: `flex`,
                            alignItems: `flex-end`,
                            gap: 0.5,
                            height: 64,
                            maxWidth: `100%`,
                          },
                          children: hsMois.map((v2, ix) =>
                            (0, $.jsxs)(
                              a,
                              {
                                title: hsMoisLabel(ix + 1) + ` : ` + v2 + ` h`,
                                sx: {
                                  flex: 1,
                                  display: `flex`,
                                  flexDirection: `column`,
                                  justifyContent: `flex-end`,
                                  alignItems: `center`,
                                  gap: 0.25,
                                  minWidth: 0,
                                },
                                children: [
                                  v2 > 0
                                    ? (0, $.jsx)(i, {
                                        variant: `caption`,
                                        sx: {
                                          fontSize: `0.55rem`,
                                          fontWeight: 800,
                                          color: `text.secondary`,
                                        },
                                        children: String(v2),
                                      })
                                    : null,
                                  (0, $.jsx)(a, {
                                    sx: {
                                      width: `100%`,
                                      height:
                                        (hsMoisMax
                                          ? Math.max(
                                              4,
                                              Math.round((v2 / hsMoisMax) * 46),
                                            )
                                          : 4) + `px`,
                                      borderRadius: 1,
                                      bgcolor:
                                        v2 > 0 ? `#7e3ff2` : `action.hover`,
                                    },
                                  }),
                                  (0, $.jsx)(i, {
                                    variant: `caption`,
                                    sx: {
                                      fontSize: `0.55rem`,
                                      color: `text.secondary`,
                                    },
                                    children: String(ix + 1),
                                  }),
                                ],
                              },
                              ix,
                            ),
                          ),
                        }),
                      ],
                    }),
                    (0, $.jsxs)(a, {
                      children: [
                        (0, $.jsx)(i, {
                          variant: `caption`,
                          fontWeight: 800,
                          sx: {
                            color: `text.secondary`,
                            display: `block`,
                            mb: 1,
                          },
                          children: `Heures supp. par département — cliquez pour filtrer`,
                        }),
                        (0, $.jsx)(a, {
                          sx: {
                            display: `flex`,
                            flexDirection: `column`,
                            gap: 0.75,
                            maxHeight: 200,
                            overflowY: `auto`,
                          },
                          children: chDepts.map((x2) =>
                            (0, $.jsxs)(
                              a,
                              {
                                onClick: () => (
                                  setDept(dept === x2.dept ? `tous` : x2.dept),
                                  setPage(0)
                                ),
                                sx: {
                                  display: `flex`,
                                  alignItems: `center`,
                                  gap: 1,
                                  cursor: `pointer`,
                                  p: 0.5,
                                  borderRadius: 1,
                                  "&:hover": { bgcolor: `action.hover` },
                                },
                                children: [
                                  (0, $.jsx)(T, {
                                    label: x2.dept,
                                    size: `small`,
                                    variant:
                                      dept === x2.dept ? `filled` : `outlined`,
                                    color:
                                      dept === x2.dept ? `primary` : `default`,
                                    sx: {
                                      fontWeight: 700,
                                      fontSize: `0.65rem`,
                                      minWidth: 90,
                                    },
                                  }),
                                  (0, $.jsx)(i, {
                                    variant: `caption`,
                                    sx: {
                                      width: 96,
                                      flexShrink: 0,
                                      color: `text.secondary`,
                                    },
                                    children: x2.n + ` décl. · ` + x2.h + ` h`,
                                  }),
                                  (0, $.jsx)(a, {
                                    sx: {
                                      flex: 1,
                                      height: 8,
                                      borderRadius: 4,
                                      bgcolor: `action.hover`,
                                      overflow: `hidden`,
                                    },
                                    children: (0, $.jsx)(a, {
                                      sx: {
                                        width:
                                          (chDeptsMax
                                            ? Math.round(
                                                (x2.h / chDeptsMax) * 100,
                                              )
                                            : 0) + `%`,
                                        height: `100%`,
                                        bgcolor: `#7e3ff2`,
                                      },
                                    }),
                                  }),
                                  (0, $.jsx)(i, {
                                    variant: `caption`,
                                    fontWeight: 800,
                                    children: x2.co ? sldFCFA(x2.co) : `—`,
                                  }),
                                ],
                              },
                              x2.dept,
                            ),
                          ),
                        }),
                        (0, $.jsx)(i, {
                          variant: `caption`,
                          fontWeight: 800,
                          sx: {
                            color: `text.secondary`,
                            display: `block`,
                            mb: 1,
                            mt: 2,
                          },
                          children: `Top consommateurs — signal de sous-effectif structurel`,
                        }),
                        (0, $.jsx)(a, {
                          sx: {
                            display: `flex`,
                            flexDirection: `column`,
                            gap: 0.75,
                          },
                          children: hsTop5.map((x2) =>
                            (0, $.jsxs)(
                              a,
                              {
                                sx: {
                                  display: `flex`,
                                  alignItems: `center`,
                                  gap: 1,
                                },
                                children: [
                                  (0, $.jsx)(T, {
                                    label: x2.emp ? B(x2.emp) : x2.id,
                                    size: `small`,
                                    variant: `outlined`,
                                    sx: {
                                      fontWeight: 700,
                                      fontSize: `0.62rem`,
                                      maxWidth: 150,
                                      overflow: `hidden`,
                                      textOverflow: `ellipsis`,
                                    },
                                  }),
                                  (0, $.jsx)(a, {
                                    sx: {
                                      flex: 1,
                                      height: 8,
                                      borderRadius: 4,
                                      bgcolor: `action.hover`,
                                      overflow: `hidden`,
                                    },
                                    children: (0, $.jsx)(a, {
                                      sx: {
                                        width:
                                          (hsTopMax
                                            ? Math.round(
                                                (x2.h / hsTopMax) * 100,
                                              )
                                            : 0) + `%`,
                                        height: `100%`,
                                        bgcolor: `#7e3ff2`,
                                      },
                                    }),
                                  }),
                                  (0, $.jsx)(i, {
                                    variant: `caption`,
                                    fontWeight: 800,
                                    children: x2.h + ` h`,
                                  }),
                                  x2.emp && x2.emp.departement
                                    ? (0, $.jsx)(i, {
                                        variant: `caption`,
                                        sx: { color: `text.secondary` },
                                        children: x2.emp.departement,
                                      })
                                    : null,
                                ],
                              },
                              x2.id,
                            ),
                          ),
                        }),
                      ],
                    }),
                  ],
                })
              : null,
          ],
        }),
      }),
      hsDlgDetail(),
      hsDlgNew(),
      hsDlgRej(),
      hsDlgPar(),
      hsDlgTaux(),
      (0, $.jsx)(d, {
        open: !!snack,
        autoHideDuration: 4500,
        onClose: () => setSnack(null),
        anchorOrigin: { vertical: `bottom`, horizontal: `center` },
        message: snack ? snack.msg : ``,
      }),
    ],
  });
}
/* ================================================================
   FICHES DE PAIE V6 — bulletins multi-modèles + personnalisation
   + CRÉATEUR DE MODÈLES A-Z (formules par pays, logo, entreprise)
   ================================================================ */
/* ================================================================
   FICHES DE PAIE V2 — écran `paie` (Domaine 2)
   ================================================================
   Pattern PointageV2/PlanningV2 : hydratation autonome
   (localStorage admina_d2_paie_v2 ?? seeds fp1-4 ?? historique simulé
   déterministe dérivé du PLANNING et du POINTAGE), bulletin calculé
   depuis les sources réelles : salaire de base du registre employés,
   HS validées/payées (montants calculés), jours d'absence du planning,
   mensualités de prêts en remboursement (config générique re.prets),
   cotisations au taux contractuel. Workflow : générée → validée →
   payée (verrou), rejet à motif, réouverture. Fiche bulletin détaillée
   (rubriques gains/déductions), génération mensuelle avec protection
   des bulletins validés/payés, pilotage 12 mois, exports CSV.
   Branchement dédié dans ie.
   ================================================================ */
var PA_LS = `admina_d2_paie_v2`;
var PA_VALID = `emp-009`;
var PA_ST = {
  generee: [`Générée`, `warning`, `outlined`],
  validee: [`Validée`, `success`, `outlined`],
  payee: [`Payée`, `info`, `filled`],
  rejetee: [`Rejetée`, `error`, `outlined`],
};
var PA_MODES = [`Virement`, `Cheque`, `Especes`, `Mobile Money`];
var PA_DEF = {
  jourLimite: 5,
  tauxDefaut: 25,
  seuilCouverture: 100,
  genAuto: 1,
  empRaison: `Admina-RH SARL`,
  empRccm: ``,
  empNiu: ``,
  empCnpsEmp: ``,
  empAdresse: ``,
  bulModele: `moderne`,
  bulAccent: ``,
  bulLogo: ``,
  bulTitre: ``,
  bulPatronal: 1,
  bulCumuls: 1,
  bulMentions: 1,
  bulSignature: 1,
  bulMention: ``,
  modeles: [],
};
function paKey(an, mois) {
  return an + `-` + (mois < 10 ? `0` : ``) + mois;
}
function paDeKey(k) {
  var m = /^(\d{4})-(\d{2})$/.exec(String(k || ``));
  return m ? { an: parseInt(m[1], 10), mois: parseInt(m[2], 10) } : null;
}
function paMoisCourt(k) {
  var p = paDeKey(k);
  return p ? hsMoisLabel(p.mois) + ` ` + p.an : String(k || `—`);
}
function paFmt(n) {
  n = Math.round(Number(n) || 0);
  var s = String(Math.abs(n));
  var out = ``;
  while (s.length > 3) {
    out = ` ` + s.slice(-3) + out;
    s = s.slice(0, -3);
  }
  return (n < 0 ? `-` : ``) + s + out + ` FCFA`;
}
function paTauxEmploye(emp, mt) {
  if (!emp || !emp.salaire_brut) return mt.tauxDefaut;
  return emp.salaire_brut >= 100000 ? 25 : 15;
}
function paStore() {
  try {
    var raw = localStorage.getItem(PA_LS);
    if (raw) {
      var st = JSON.parse(raw);
      if (st && st.records && st.records.length) return st;
    }
  } catch (err) {}
  return { v: 1, records: paSeedRegen().concat(paSim()), meta: {} };
}
function paSave(st) {
  try {
    localStorage.setItem(PA_LS, JSON.stringify(st));
  } catch (err) {}
}
function paMeta(st) {
  var m = (st && st.meta) || {};
  return Object.assign({}, PA_DEF, m);
}
/* — Évaluation d'un bulletin depuis les SOURCES RÉELLES :
   base = registre employés · HS = hsToutes (montants calculés,
   rattachement ISO mois du jeudi, validee/payee) · absences = journal
   planning (retenue base/26 · jours absents, art. 86 CT) · prêt =
   mensualité des remboursements en cours (config re.prets). — */
function paHSfMois(eid, an, mois) {
  var total = 0;
  hsToutes().forEach(function (h) {
    if (h.employee_id !== eid) return;
    if (h.statut === `rejetee` || h.statut === `en_attente`) return;
    var si = hsSemInfo(h.semaine);
    if (si && String(si.an) === String(an) && hsSemMois(si.num, si.an) === mois)
      total +=
        h.montant_calcule != null
          ? Number(h.montant_calcule) || 0
          : h.montant_brut != null
            ? Number(h.montant_brut) || 0
            : 0;
  });
  return Math.round(total);
}
function paPretRetenue(eid) {
  var total = 0;
  try {
    var rows = (re && re.prets && re.prets.data) || [];
    rows.forEach(function (p) {
      if (p.employee_id !== eid) return;
      if (p.statut === `en_remboursement` && (p.solde_restant || 0) > 0)
        total += Number(p.mensualite) || 0;
    });
  } catch (err) {}
  return Math.round(total);
}
function paEval(eid, an, mois, pLine, mt) {
  var emp = R(eid);
  var base = emp && emp.salaire_brut ? Math.round(emp.salaire_brut) : 0;
  var retenueAbs = 0;
  var hsMont = 0;
  var g = null;
  if (pLine) {
    g = pLine;
    retenueAbs = Math.round(((base / 26) * (pLine.jours_absents || 0) * 100) / 100);
    hsMont = paHSfMois(eid, an, mois);
  }
  var brut = Math.max(0, base - retenueAbs + hsMont);
  var taux = paTauxEmploye(emp, mt);
  var cotis = Math.round((brut * taux) / 100);
  var pret = paPretRetenue(eid);
  var net = brut - cotis - pret;
  return {
    emp: emp,
    base: base,
    hsMont: hsMont,
    retenueAbs: retenueAbs,
    joursAbs: g ? g.jours_absents || 0 : 0,
    joursPres: g ? g.jours_presents || 0 : 0,
    retards: g ? g.retards_minutes || 0 : 0,
    brut: brut,
    tauxCharges: taux,
    cotisations: cotis,
    pretRetenue: pret,
    net: Math.max(0, net),
    hsHeures: g ? g.heures_supp || 0 : 0,
    vide: pLine ? pLine.vide || 0 : 1,
    dept: emp && emp.departement ? emp.departement : `—`,
  };
}
/* — Seeds d'origine CONSERVÉS (ids fp1-fp4, statuts et modes d'origine)
   mais valeurs recalculées depuis les sources pour cohérence. Les
   employés sans registre (salaire inconnu) gardent leurs valeurs seed. — */
var PA_SEED = null;
function paSeedRaw() {
  if (PA_SEED) return PA_SEED;
  PA_SEED = [
    { id: `fp1`, employee_id: `emp-001`, mois: `2025-08`, mode_paie: `Virement`, statut: `payee` },
    { id: `fp2`, employee_id: `emp-002`, mois: `2025-08`, mode_paie: `Virement`, statut: `payee` },
    { id: `fp3`, employee_id: `emp-008`, mois: `2025-08`, mode_paie: `Cheque`, statut: `validee` },
    { id: `fp4`, employee_id: `emp-013`, mois: `2025-08`, mode_paie: `Especes`, statut: `generee` },
  ];
  return PA_SEED;
}
function paSeedRegen() {
  var mt = paMeta(paStoreRaw());
  return paSeedRaw().map(function (r) {
    var p = paDeKey(r.mois);
    var pline = null;
    plStore().records.forEach(function (x) {
      if (x.employee_id === r.employee_id && x.mois === r.mois) pline = x;
    });
    var e = paEval(r.employee_id, p ? p.an : 2025, p ? p.mois : 8, pline, mt);
    var base = e.base;
    if (!base)
      base = r.employee_id === `emp-002` ? 980000 : r.employee_id === `emp-013` ? 80000 : 0;
    var brut = base ? e.brut : 0;
    var cotis = Math.round((brut * e.tauxCharges) / 100);
    var pret = base ? e.pretRetenue : 0;
    return Object.assign({}, r, {
      salaire_base: base,
      hs_montant: base ? e.hsMont : 0,
      retenue_absences: base ? e.retenueAbs : 0,
      salaire_brut: brut,
      taux_charges: e.tauxCharges,
      cotisations: cotis,
      pret_retenue: pret,
      net_a_payer: Math.max(0, brut - cotis - pret),
      genere_le: `2025-09-01`,
      genere_de: `seed`,
      valide_par: r.statut === `validee` || r.statut === `payee` ? PA_VALID : null,
      valide_le: r.statut === `validee` || r.statut === `payee` ? `2025-09-02` : null,
      paye_le: r.statut === `payee` ? `2025-09-03` : null,
      reference: r.statut === `payee` ? `PAY-2025-08-` + r.employee_id : null,
      motif_rejet: null,
      jours_absents: e.joursAbs,
      jours_presents: e.joursPres,
    });
  });
}
function paStoreRaw() {
  try {
    var raw = localStorage.getItem(PA_LS);
    if (raw) {
      var st = JSON.parse(raw);
      if (st && st.records) return st;
    }
  } catch (err) {}
  return { v: 1, records: [], meta: {} };
}
/* — Historique simulé DÉRIVÉ du planning (cohérence inter-écrans
   garantie : planning clôturé → bulletin payé, planning validé →
   bulletin validé, mois courant → bulletin généré). — */
var PA_SIM_CACHE = null;
function paSim() {
  if (PA_SIM_CACHE) return PA_SIM_CACHE;
  var mt = paMeta({ records: [], meta: {} });
  var auj = new Date().toISOString().slice(0, 10);
  var nowAn = new Date().getFullYear();
  var nowMois = new Date().getMonth() + 1;
  var by = {};
  plStore().records.forEach(function (r) {
    if (r.vide) return;
    var k = r.employee_id + `|` + r.mois;
    if (!by[k]) by[k] = r;
  });
  var out = [];
  Object.keys(by)
    .sort()
    .forEach(function (k) {
      var r = by[k];
      var p = paDeKey(r.mois);
      if (!p) return;
      if (p.an > nowAn || (p.an === nowAn && p.mois > nowMois)) return;
      var e = paEval(r.employee_id, p.an, p.mois, r, mt);
      if (!e.base) return;
      var isCur = p.an === nowAn && p.mois === nowMois;
      var statut = r.statut === `cloture` ? `payee` : r.statut === `valide` ? `validee` : `generee`;
      var fin = new Date(Date.UTC(p.an, p.mois, 0)).toISOString().slice(0, 10);
      out.push({
        id: `pa-sim-` + r.employee_id + `-` + r.mois,
        employee_id: r.employee_id,
        mois: r.mois,
        salaire_base: e.base,
        hs_montant: e.hsMont,
        retenue_absences: e.retenueAbs,
        salaire_brut: e.brut,
        taux_charges: e.tauxCharges,
        cotisations: e.cotisations,
        pret_retenue: e.pretRetenue,
        net_a_payer: e.net,
        mode_paie: `Virement`,
        statut: statut,
        genere_le: auj < fin ? auj : fin,
        genere_de: `pointage`,
        jours_absents: e.joursAbs,
        jours_presents: e.joursPres,
        valide_par: statut === `validee` || statut === `payee` ? PA_VALID : null,
        valide_le:
          statut === `validee` || statut === `payee`
            ? new Date(Date.UTC(p.an, p.mois, 1)).toISOString().slice(0, 10)
            : null,
        paye_le: statut === `payee` ? fin : null,
        reference: statut === `payee` ? `PAY-` + r.mois + `-` + r.employee_id : null,
        motif_rejet: null,
        vide: 0,
      });
    });
  PA_SIM_CACHE = out;
  return out;
}
function paToutes() {
  var st = paStore();
  var v2s = (st.records || []).map(function (r) {
    return Object.assign({ source: `v2` }, r);
  });
  var ids = {};
  v2s.forEach(function (r) {
    ids[r.employee_id + `|` + r.mois] = 1;
  });
  var seeds = paSeedRegen()
    .filter(function (r) {
      return !ids[r.employee_id + `|` + r.mois];
    })
    .map(function (r) {
      return Object.assign({ source: `seed` }, r);
    });
  seeds.forEach(function (r) {
    ids[r.employee_id + `|` + r.mois] = 1;
  });
  var sims = paSim()
    .filter(function (r) {
      return !ids[r.employee_id + `|` + r.mois];
    })
    .map(function (r) {
      return Object.assign({ source: `sim` }, r);
    });
  return v2s.concat(seeds, sims);
}
/* — Génération / recalcul des bulletins d'un mois : liste des employés
   = pointage ∪ planning ∪ seeds paie. Les bulletins validés ou payés
   ne sont JAMAIS modifiés (protection manager). Retourne compteurs. — */
function paGenApplique(st, an, mois) {
  var mt = paMeta(st);
  var mKey = paKey(an, mois);
  var pts = ptStore().records;
  var pls = plStore().records;
  var ids = {};
  pts.forEach(function (r) {
    ids[r.employee_id] = 1;
  });
  pls.forEach(function (r) {
    ids[r.employee_id] = 1;
  });
  paSeedRaw().forEach(function (r) {
    ids[r.employee_id] = 1;
  });
  var auj = new Date().toISOString().slice(0, 10);
  var seedProt = {};
  paSeedRaw().forEach(function (s) {
    seedProt[s.employee_id + `|` + s.mois] = s.statut;
  });
  var byPl = {};
  pls.forEach(function (r) {
    if (r.mois !== mKey) return;
    if (!byPl[r.employee_id]) byPl[r.employee_id] = r;
  });
  var cree = 0,
    recalc = 0,
    protege = 0;
  Object.keys(ids)
    .sort()
    .forEach(function (eid) {
      var exist = (st.records || []).find(function (x) {
        return x.employee_id === eid && x.mois === mKey;
      });
      if (exist && (exist.statut === `validee` || exist.statut === `payee`)) {
        protege++;
        return;
      }
      var sp = seedProt[eid + `|` + mKey];
      if (
        !exist &&
        (sp === `validee` || sp === `payee`)
      ) {
        protege++;
        return;
      }
      var pline = byPl[eid] || null;
      var e = paEval(eid, an, mois, pline, mt);
      if (!e.base) return;
      var rec = exist || {
        id: `pa-` + eid + `-` + mKey,
        employee_id: eid,
        mois: mKey,
        mode_paie: `Virement`,
        genere_de: `pointage`,
        reference: null,
      };
      rec.salaire_base = e.base;
      rec.hs_montant = e.hsMont;
      rec.retenue_absences = e.retenueAbs;
      rec.salaire_brut = e.brut;
      rec.taux_charges = e.tauxCharges;
      rec.cotisations = e.cotisations;
      rec.pret_retenue = e.pretRetenue;
      rec.net_a_payer = e.net;
      rec.jours_absents = e.joursAbs;
      rec.jours_presents = e.joursPres;
      rec.genere_le = auj;
      rec.vide = e.vide;
      if (!exist) {
        rec.statut = `generee`;
        rec.valide_par = null;
        rec.valide_le = null;
        rec.paye_le = null;
        rec.motif_rejet = null;
        st.records = st.records || [];
        st.records.push(rec);
        cree++;
      } else {
        if (exist.statut === `rejetee`) rec.statut = `generee`;
        recalc++;
      }
    });
  PA_SIM_CACHE = null;
  return { cree: cree, recalc: recalc, protege: protege, emps: Object.keys(ids).length };
}
/* — Génération auto du mois courant à l'ouverture (une seule fois par
   session) : matérialise « Génération: presence + congés + HS - prêts »
   annoncé par le sous-titre d'origine. — */
var PA_AUTO_DONE = !1;
function paAutoGen() {
  if (PA_AUTO_DONE) return !1;
  PA_AUTO_DONE = !0;
  var mt = paMeta(paStore());
  if (!mt.genAuto) return !1;
  var now = new Date();
  var key = paKey(now.getFullYear(), now.getMonth() + 1);
  var st = paStore();
  if ((st.records || []).some(function (r) {
    return r.mois === key;
  }))
    return !1;
  paGenApplique(st, now.getFullYear(), now.getMonth() + 1);
  paSave(st);
  return !0;
}
function paAnAuto(rows) {
  var m = {};
  var cur = String(new Date().getFullYear());
  var best = cur,
    nb = 0;
  (rows || []).forEach(function (rd) {
    var k = String(rd.mois || ``).slice(0, 4);
    if (!/^\d{4}$/.test(k)) return;
    m[k] = (m[k] || 0) + 1;
    if (m[k] > nb) ((nb = m[k]), (best = k));
  });
  if (m[cur]) best = cur;
  return best;
}
function PaieV2() {
  var nowAn = new Date().getFullYear(),
    nowMois = new Date().getMonth() + 1;
  var stTick = (0, Q.useState)(0),
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
    stAn = (0, Q.useState)(() => paAnAuto(paToutes())),
    an = stAn[0],
    setAn = stAn[1],
    stMoisF = (0, Q.useState)(`tous`),
    moisF = stMoisF[0],
    setMoisF = stMoisF[1],
    stTri = (0, Q.useState)({ key: `mois`, dir: `desc` }),
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
    stNew = (0, Q.useState)(!1),
    dlgNew = stNew[0],
    setDlgNew = stNew[1],
    stGenAn = (0, Q.useState)(() => String(new Date().getFullYear())),
    genAn = stGenAn[0],
    setGenAn = stGenAn[1],
    stGenMois = (0, Q.useState)(() => String(new Date().getMonth() + 1)),
    genMois = stGenMois[0],
    setGenMois = stGenMois[1],
    stPar = (0, Q.useState)(!1),
    dlgPar = stPar[0],
    setDlgPar = stPar[1],
    stSel = (0, Q.useState)({}),
    sel = stSel[0],
    setSel = stSel[1],
    stRej = (0, Q.useState)(null),
    dlgRej = stRej[0],
    setDlgRej = stRej[1],
    stMotR = (0, Q.useState)(``),
    motRej = stMotR[0],
    setMotRej = stMotR[1],
    stPay = (0, Q.useState)(null),
    dlgPay = stPay[0],
    setDlgPay = stPay[1],
    stPayMode = (0, Q.useState)(`Virement`),
    payMode = stPayMode[0],
    setPayMode = stPayMode[1],
    stPayRef = (0, Q.useState)(``),
    payRef = stPayRef[0],
    setPayRef = stPayRef[1],
    stCh = (0, Q.useState)(1),
    chOpen = stCh[0],
    setCh = stCh[1],
    stPj = (0, Q.useState)(`5`),
    pJl = stPj[0],
    setPJl = stPj[1],
    stPt = (0, Q.useState)(`25`),
    pTd = stPt[0],
    setPTd = stPt[1],
    stPg = (0, Q.useState)(`1`),
    pGa = stPg[0],
    setPGa = stPg[1],
    stRa = (0, Q.useState)(``),
    pRaison = stRa[0],
    setPRaison = stRa[1],
    stRc = (0, Q.useState)(``),
    pRccm = stRc[0],
    setPRccm = stRc[1],
    stNi = (0, Q.useState)(``),
    pNiu = stNi[0],
    setPNiu = stNi[1],
    stCe = (0, Q.useState)(``),
    pCnpsEmp = stCe[0],
    setPCnpsEmp = stCe[1],
    stAd = (0, Q.useState)(``),
    pAdr = stAd[0],
    setPAdr = stAd[1],
    stNav = (0, Q.useState)(null),
    navIds = stNav[0],
    setNavIds = stNav[1],
    stDb = (0, Q.useState)(!1),
    dlgBul = stDb[0],
    setDlgBul = stDb[1],
    stPbm = (0, Q.useState)(`moderne`),
    pbModele = stPbm[0],
    setPbModele = stPbm[1],
    stPbc = (0, Q.useState)(`#1e3a8a`),
    pbAccent = stPbc[0],
    setPbAccent = stPbc[1],
    stPbl = (0, Q.useState)(``),
    pbLogo = stPbl[0],
    setPbLogo = stPbl[1],
    stPbt = (0, Q.useState)(``),
    pbTitre = stPbt[0],
    setPbTitre = stPbt[1],
    stPbp = (0, Q.useState)(`1`),
    pbPatronal = stPbp[0],
    setPbPatronal = stPbp[1],
    stPbu = (0, Q.useState)(`1`),
    pbCumuls = stPbu[0],
    setPbCumuls = stPbu[1],
    stPbn = (0, Q.useState)(`1`),
    pbMentions = stPbn[0],
    setPbMentions = stPbn[1],
    stPbs = (0, Q.useState)(`1`),
    pbSignature = stPbs[0],
    setPbSignature = stPbs[1],
    stPbz = (0, Q.useState)(``),
    pbMention = stPbz[0],
    setPbMention = stPbz[1],
    stTplO = (0, Q.useState)(!1),
    dlgTpl = stTplO[0],
    setDlgTpl = stTplO[1],
    stTplE = (0, Q.useState)(null),
    tplEd = stTplE[0],
    setTplEd = stTplE[1],
    stTplI = (0, Q.useState)(``),
    tplSelId = stTplI[0],
    setTplSelId = stTplI[1],
    stTplV = (0, Q.useState)(``),
    tplEmpId = stTplV[0],
    setTplEmpId = stTplV[1];
  var depts = (0, Q.useMemo)(() => {
    var s2 = new Set();
    paToutes().forEach((r) => {
      var emp = R(r.employee_id);
      if (emp && emp.departement) s2.add(emp.departement);
    });
    return Array.from(s2).sort();
  }, []);
  var mt = (0, Q.useMemo)(() => paMeta(paStore()), [tick]);
  var ALL = (0, Q.useMemo)(() => {
    paAutoGen();
    return paToutes().map((r) => {
      var k = paDeKey(r.mois);
      var emp = R(r.employee_id);
      var isPast = k ? k.an < nowAn || (k.an === nowAn && k.mois < nowMois) : !1;
      var lim = new Date(Date.UTC(k ? k.an : nowAn, k ? k.mois : nowMois, mt.jourLimite))
        .toISOString()
        .slice(0, 10);
      var horsDelai =
        isPast &&
        (r.statut === `generee` || r.statut === `rejetee`) &&
        lim < new Date().toISOString().slice(0, 10);
      return Object.assign({}, r, {
        emp: emp,
        an: k ? k.an : 0,
        moisNum: k ? k.mois : 0,
        mIdx: k ? k.an * 12 + (k.mois - 1) : 0,
        isPast: isPast,
        horsDelai: horsDelai,
        dept: emp && emp.departement ? emp.departement : `—`,
      });
    });
  }, [tick]);
  var allAn = (0, Q.useMemo)(() => ALL.filter((r) => String(r.an) === String(an)), [ALL, an]);
  var moisList = (0, Q.useMemo)(() => {
    var set = {};
    allAn.forEach((r) => (set[r.mois] = 1));
    return Object.keys(set).sort().reverse();
  }, [allAn]);
  var srt = (0, Q.useMemo)(() => {
    var out = allAn.filter((r) => {
      var emp = r.emp ? B(r.emp).toLowerCase() : ``;
      if (rech) {
        var q2 = rech.toLowerCase();
        if (
          !emp.includes(q2) &&
          !String(r.mois).toLowerCase().includes(q2) &&
          !((r.emp && r.emp.matricule) || ``).toLowerCase().includes(q2) &&
          !(r.reference || ``).toLowerCase().includes(q2)
        )
          return !1;
      }
      if (dept !== `tous` && r.dept !== dept) return !1;
      if (moisF !== `tous` && r.mois !== moisF) return !1;
      if (statutF === `hors_delai` && !r.horsDelai) return !1;
      else if (statutF === `hs` && !(r.hs_montant > 0)) return !1;
      else if (statutF === `pret` && !(r.pret_retenue > 0)) return !1;
      else if (
        [`generee`, `validee`, `payee`, `rejetee`].indexOf(statutF) >= 0 &&
        r.statut !== statutF
      )
        return !1;
      return !0;
    });
    var f = {
      mois: (r) => r.mIdx,
      emp: (r) => (r.emp ? B(r.emp) : ``),
      base: (r) => r.salaire_base || 0,
      hs: (r) => r.hs_montant || 0,
      brut: (r) => r.salaire_brut || 0,
      cotis: (r) => r.cotisations || 0,
      pret: (r) => r.pret_retenue || 0,
      net: (r) => r.net_a_payer || 0,
      statut: (r) => r.statut,
    };
    var kk = f[tri.key] || f.mois;
    out.sort((x2, y2) => {
      var vx = kk(x2),
        vy = kk(y2);
      var c = vx < vy ? -1 : vx > vy ? 1 : 0;
      return tri.dir === `asc` ? c : -c;
    });
    return out;
  }, [allAn, rech, dept, moisF, statutF, tri]);
  var selCount = Object.keys(sel).length;
  /* — KPI 1 : masse salariale nette du dernier mois complet (Δ vs précédent).
     Le mois courant partiel est écarté si < 60 % des bulletins attendus. — */
  var attendusParMois = (0, Q.useMemo)(() => {
    var m = {};
    ALL.forEach((r) => {
      m[r.mois] = (m[r.mois] || 0) + 1;
    });
    return m;
  }, [ALL]);
  var dernierMois = (0, Q.useMemo)(() => {
    var curKey = paKey(nowAn, nowMois);
    var curLines = ALL.filter((r) => r.mois === curKey && !r.vide);
    var cand = ALL.filter(
      (r) => !r.vide && r.mIdx <= nowAn * 12 + (nowMois - 1) && r.mois !== curKey,
    );
    if (!cand.length) return null;
    var best = cand[0];
    cand.forEach((r) => {
      if (r.mIdx > best.mIdx) best = r;
    });
    void curKey;
    void curLines;
    return best.mois;
  }, [ALL]);
  var kpiMasse = (0, Q.useMemo)(() => {
    if (!dernierMois) return { tot: 0, d: 0, n: 0 };
    var k = paDeKey(dernierMois);
    var kPrev = k.mois === 1 ? paKey(k.an - 1, 12) : paKey(k.an, k.mois - 1);
    function tot(mk) {
      var l2 = ALL.filter((r) => r.mois === mk && !r.vide);
      return l2.reduce((s2, r) => s2 + (r.net_a_payer || 0), 0);
    }
    function nn(mk) {
      return ALL.filter((r) => r.mois === mk && !r.vide).length;
    }
    var t = tot(dernierMois),
      tp = tot(kPrev);
    return {
      tot: t,
      d: tp > 0 ? Math.round((100 * (t - tp)) / tp) : 0,
      n: nn(dernierMois),
    };
  }, [ALL, dernierMois]);
  var kpiAtt = (0, Q.useMemo)(() => {
    var l2 = ALL.filter(
      (r) => (r.statut === `generee` || r.statut === `rejetee`) && !r.vide,
    );
    return { n: l2.length, horsDelai: l2.filter((r) => r.horsDelai).length };
  }, [ALL]);
  var kpiPaye = (0, Q.useMemo)(() => {
    var l2 = allAn.filter((r) => r.statut === `payee`);
    return {
      n: l2.length,
      tot: l2.reduce((s2, r) => s2 + (r.net_a_payer || 0), 0),
    };
  }, [allAn]);
  var kpiCouvr = (0, Q.useMemo)(() => {
    var moisEcoules = [];
    for (var mo = 1; mo <= 12; mo++) {
      if (String(an) < String(nowAn) || (String(an) === String(nowAn) && mo <= nowMois))
        moisEcoules.push(paKey(an, mo));
    }
    var attendus = moisEcoules.length * (attendusParMois[moisEcoules[moisEcoules.length - 1]] || 0);
    var generes = moisEcoules.reduce((s2, mk) => s2 + (attendusParMois[mk] || 0), 0);
    return {
      pct: attendus > 0 ? Math.min(100, Math.round((100 * generes) / attendus)) : 0,
      generes: generes,
      attendus: attendus,
    };
  }, [ALL, allAn, attendusParMois, an]);
  var bandAlert = (0, Q.useMemo)(() => {
    var parts = [];
    if (kpiAtt.horsDelai)
      parts.push(
        kpiAtt.horsDelai +
          ` bulletin(s) au-delà du jour limite (J+` +
          mt.jourLimite +
          ` — Objectif 3)`,
      );
    var aPayer = allAn.filter((r) => r.statut === `validee` && !r.vide).length;
    if (aPayer) parts.push(aPayer + ` bulletin(s) validé(s) en attente de paiement`);
    var nImp = kpiCouvr.attendus - kpiCouvr.generes;
    if (nImp > 0 && kpiCouvr.pct < mt.seuilCouverture)
      parts.push(nImp + ` bulletin(s) attendu(s) manquant(s) — couverture ` + kpiCouvr.pct + ` %`);
    return parts.length ? parts.join(` · `) : null;
  }, [kpiAtt, allAn, kpiCouvr, mt]);
  /* — Actions workflow. Les bulletins dérivés (seed/sim) sont
     MATERIALIZÉS dans le store à la première action (la dédup paToutes
     privilégie le store) — UN SEUL store par action : fMater reçoit
     l'instance de l'appelant pour éviter toute perte de mutation. — */
  var fMater = (r, st) => {
    var rec = st.records.find((x) => x.id === r.id);
    if (!rec) {
      rec = {
        id: r.id,
        employee_id: r.employee_id,
        mois: r.mois,
        salaire_base: r.salaire_base,
        hs_montant: r.hs_montant,
        retenue_absences: r.retenue_absences,
        salaire_brut: r.salaire_brut,
        taux_charges: r.taux_charges,
        cotisations: r.cotisations,
        pret_retenue: r.pret_retenue,
        net_a_payer: r.net_a_payer,
        mode_paie: r.mode_paie,
        genere_le: r.genere_le || new Date().toISOString().slice(0, 10),
        genere_de: r.genere_de || r.source || `manuel`,
        jours_absents: r.jours_absents || 0,
        jours_presents: r.jours_presents || 0,
      };
      st.records.push(rec);
    }
    return rec;
  };
  var fValider = (ids) => {
    var st = paStore();
    var today = new Date().toISOString().slice(0, 10);
    var n2 = 0,
      skip = 0;
    ids.forEach((id) => {
      var r = ALL.find((x) => x.id === id);
      if (!r || r.statut === `payee`) {
        skip++;
        return;
      }
      var rec = fMater(r, st);
      rec.statut = `validee`;
      rec.valide_par = PA_VALID;
      rec.valide_le = today;
      rec.motif_rejet = null;
      n2++;
    });
    paSave(st);
    setSel({});
    setTick(tick + 1);
    setSnack({
      msg:
        n2 +
        ` bulletin(s) validé(s) — prêts pour le paiement` +
        (skip ? ` · ` + skip + ` ignoré(s) (déjà payé)` : ``) +
        `.`,
      sev: `success`,
    });
  };
  var fOuvrirPayer = (rows) => {
    var rows0 = rows.filter((r) => r.statut === `validee`);
    if (!rows0.length) {
      setSnack({ msg: `Sélectionnez des bulletins VALIDÉS à payer.`, sev: `warning` });
      return;
    }
    setDlgPay(rows0);
    setPayMode(`Virement`);
    setPayRef(
      `LOT-` +
        String(new Date().toISOString().slice(0, 10)).replace(/-/g, ``) +
        `-` +
        rows0.length,
    );
  };
  var fConfPayer = () => {
    var today = new Date().toISOString().slice(0, 10);
    var rows = dlgPay || [];
    var st = paStore();
    var n2 = 0,
      tot = 0;
    rows.forEach((r) => {
      var rec = fMater(r, st);
      if (rec.statut !== `validee` && rec.statut !== `generee` && rec.statut !== `rejetee`)
        return;
      if (r.statut !== `validee`) return; /* seul un bulletin validé (lu dans ALL) se paie */
      rec.statut = `payee`;
      rec.paye_par = PA_VALID;
      rec.paye_le = today;
      rec.mode_paie = payMode;
      rec.reference = payRef || `PAY-` + rec.mois + `-` + rec.employee_id;
      n2++;
      tot += rec.net_a_payer || 0;
    });
    paSave(st);
    setDlgPay(null);
    setSel({});
    setTick(tick + 1);
    setSnack({
      msg:
        n2 +
        ` bulletin(s) payé(s) — ` +
        paFmt(tot) +
        (payRef ? ` · réf. ` + payRef : ``),
      sev: n2 ? `success` : `warning`,
    });
  };
  var fConfRejeter = () => {
    var rw = dlgRej;
    if (!rw) return;
    if (!motRej.trim()) {
      setSnack({ msg: `Motif de rejet OBLIGATOIRE.`, sev: `error` });
      return;
    }
    var st = paStore();
    var rec = fMater(rw, st);
    rec.statut = `rejetee`;
    rec.motif_rejet = motRej.trim();
    paSave(st);
    setDlgRej(null);
    setMotRej(``);
    setSel({});
    setTick(tick + 1);
    setSnack({ msg: `Bulletin rejeté — correction attendue.`, sev: `warning` });
  };
  var fReOuvrir = (rw) => {
    if (rw.statut === `payee`) return;
    var st = paStore();
    var rec = fMater(rw, st);
    rec.statut = `generee`;
    rec.motif_rejet = null;
    rec.valide_par = null;
    rec.valide_le = null;
    paSave(st);
    setTick(tick + 1);
    setSnack({ msg: `Bulletin réouvert — retour en généré.`, sev: `info` });
  };
  var fGen = () => {
    var st = paStore();
    var res = paGenApplique(st, parseInt(genAn, 10), parseInt(genMois, 10));
    paSave(st);
    setDlgNew(!1);
    setAn(genAn);
    var kkGen = paKey(parseInt(genAn, 10), parseInt(genMois, 10));
    setMoisF(kkGen);
    setPage(0);
    setTick(tick + 1);
    var listeGen = [];
    paToutes().forEach(function (r2) {
      if (r2.mois === kkGen)
        listeGen.push(Object.assign({}, r2, { emp: R(r2.employee_id) }));
    });
    if (listeGen.length) {
      setNavIds(listeGen.map(function (r2) { return r2.id; }));
      setDetail(listeGen[0]);
    } else setNavIds(null);
    setSnack({
      msg:
        `Génération depuis les sources (pointage, HS, prêts) — ` +
        res.cree +
        ` bulletin(s) créé(s), ` +
        res.recalc +
        ` recalculé(s), ` +
        res.protege +
        ` protégé(s) sur ` +
        res.emps +
        ` employé(s).`,
      sev: `success`,
    });
  };
  var fSaveBul = () => {
    var st = paStore();
    st.meta = Object.assign({}, st.meta, {
      bulModele: PA_MODELES[pbModele] ? pbModele : `moderne`,
      bulAccent: /^#[0-9a-fA-F]{6}$/.test(pbAccent.trim()) ? pbAccent.trim() : ``,
      bulLogo: pbLogo.trim(),
      bulTitre: pbTitre.trim(),
      bulPatronal: pbPatronal === `1` ? 1 : 0,
      bulCumuls: pbCumuls === `1` ? 1 : 0,
      bulMentions: pbMentions === `1` ? 1 : 0,
      bulSignature: pbSignature === `1` ? 1 : 0,
      bulMention: pbMention.trim(),
    });
    paSave(st);
    setDlgBul(!1);
    setTick(tick + 1);
    setSnack({
      msg: `Bulletin personnalisé — modèle et préférences enregistrés (persistants).`,
      sev: `success`,
    });
  };
  var fResetBul = () => {
    var st = paStore();
    st.meta = Object.assign({}, st.meta, {
      bulModele: `moderne`,
      bulAccent: ``,
      bulLogo: ``,
      bulTitre: ``,
      bulPatronal: 1,
      bulCumuls: 1,
      bulMentions: 1,
      bulSignature: 1,
      bulMention: ``,
    });
    paSave(st);
    setPbModele(`moderne`);
    setPbAccent(`#1e3a8a`);
    setPbLogo(``);
    setPbTitre(``);
    setPbPatronal(`1`);
    setPbCumuls(`1`);
    setPbMentions(`1`);
    setPbSignature(`1`);
    setPbMention(``);
    setTick(tick + 1);
    setSnack({
      msg: `Préférences du bulletin réinitialisées (modèle Moderne par défaut).`,
      sev: `info`,
    });
  };
  var fSavePar = () => {
    var st = paStore();
    st.meta = Object.assign({}, st.meta, {
      jourLimite: parseInt(pJl, 10) || mt.jourLimite,
      tauxDefaut: parseInt(pTd, 10) || mt.tauxDefaut,
      genAuto: pGa === `1` ? 1 : 0,
      empRaison: pRaison.trim(),
      empRccm: pRccm.trim(),
      empNiu: pNiu.trim(),
      empCnpsEmp: pCnpsEmp.trim(),
      empAdresse: pAdr.trim(),
    });
    paSave(st);
    setDlgPar(!1);
    setTick(tick + 1);
    setSnack({
      msg: `Paramètres de paie enregistrés (persistants).`,
      sev: `success`,
    });
  };
  var fTri = (key) =>
    setTri((t2) => ({ key: key, dir: t2.key === key && t2.dir === `desc` ? `asc` : `desc` }));
  /* — Sélection groupée par clic ligne (pattern PointageV2) — */
  var fToggle = (rw) => {
    if (rw.statut === `payee`) return;
    setSel((s2) => {
      var n2 = Object.assign({}, s2);
      if (n2[rw.id]) delete n2[rw.id];
      else n2[rw.id] = 1;
      return n2;
    });
  };
  var fSelTous = (checked) => {
    if (!checked) {
      setSel({});
      return;
    }
    var n2 = {};
    srt
      .filter((r) => r.statut !== `payee`)
      .slice(page * pp, page * pp + pp)
      .forEach((r) => (n2[r.id] = 1));
    setSel(n2);
  };
  var paCvsRows = (rows) => {
    var out = [
      [
        `Matricule`,
        `Employé`,
        `Département`,
        `Mois`,
        `Salaire base`,
        `HS (montant)`,
        `Retenue absences`,
        `Brut`,
        `Taux charges (%)`,
        `Cotisations`,
        `Retenue prêt`,
        `Net à payer`,
        `Mode`,
        `Statut`,
        `Généré le`,
        `Validé le`,
        `Payé le`,
        `Référence`,
        `Motif rejet`,
      ],
    ];
    rows.forEach((r) => {
      out.push(
        [
          (r.emp && r.emp.matricule) || `—`,
          r.emp ? B(r.emp) : r.employee_id,
          r.dept,
          r.mois,
          r.salaire_base || 0,
          r.hs_montant || 0,
          r.retenue_absences || 0,
          r.salaire_brut || 0,
          r.taux_charges,
          r.cotisations || 0,
          r.pret_retenue || 0,
          r.net_a_payer || 0,
          r.mode_paie || `—`,
          (PA_ST[r.statut] || [r.statut])[0],
          r.genere_le || `—`,
          r.valide_le || `—`,
          r.paye_le || `—`,
          r.reference || `—`,
          r.motif_rejet || ``,
        ].map((x2) =>
          String(x2 == null ? `` : x2)
            .replace(/;/g, `,`)
            .replace(/\n/g, ` `),
        ),
      );
    });
    return out;
  };
  var fDownload = (rows, nom, msg) => {
    var csv = paCvsRows(rows)
      .map((l2) => l2.join(`;`))
      .join(`\n`);
    var blob = new Blob([`\ufeff` + csv], { type: `text/csv;charset=utf-8` });
    var a2 = document.createElement(`a`);
    a2.href = URL.createObjectURL(blob);
    a2.download = nom;
    a2.click();
    URL.revokeObjectURL(a2.href);
    setSnack({ msg: msg, sev: `success` });
  };
  var fExport = () => {
    var rows = srt;
    if (!rows.length) {
      setSnack({ msg: `Aucune ligne à exporter (vérifiez les filtres).`, sev: `warning` });
      return;
    }
    fDownload(
      rows,
      `fiches_paie_` + an + `.csv`,
      `Export CSV — ` + rows.length + ` bulletin(s) (19 colonnes, valeurs réelles).`,
    );
  };
  var fExportCompta = () => {
    var rows = allAn.filter((r) => r.statut === `payee`);
    if (!rows.length) {
      setSnack({
        msg: `Aucun bulletin payé à exporter pour l'exercice ` + an + `.`,
        sev: `warning`,
      });
      return;
    }
    fDownload(
      rows,
      `paie_compta_` + an + `.csv`,
      rows.length + ` bulletin(s) PAYÉ(S) exportés — lot comptabilité (exercice ` + an + `).`,
    );
  };
  /* — Pilotage : séries 12 mois, départements, top, modes — */
  var pilMois = (0, Q.useMemo)(() => {
    var keys = {};
    ALL.forEach((r) => {
      if (r.an === parseInt(an, 10)) keys[r.mois] = 1;
    });
    var ks = Object.keys(keys).sort().slice(-12);
    return ks.map((k) => {
      var l2 = ALL.filter((r) => r.mois === k && !r.vide);
      var net = l2.reduce((s2, r) => s2 + (r.net_a_payer || 0), 0);
      var hs = l2.reduce((s2, r) => s2 + (r.hs_montant || 0), 0);
      var p = paDeKey(k);
      return {
        key: k,
        lbl: p ? hsMoisLabel(p.mois).slice(0, 3) : k,
        net: net,
        hs: hs,
        n: l2.length,
      };
    });
  }, [ALL, an]);
  var pilDept = (0, Q.useMemo)(() => {
    var m = {};
    allAn
      .filter((r) => !r.vide)
      .forEach((r) => {
        var d = r.dept || `—`;
        m[d] = (m[d] || 0) + (r.net_a_payer || 0);
      });
    var arr = Object.keys(m)
      .map((d) => ({ dept: d, tot: m[d] }))
      .sort((x2, y2) => y2.tot - x2.tot);
    var max = arr.length ? arr[0].tot : 1;
    return arr.slice(0, 7).map((d) => ({
      dept: d.dept,
      tot: d.tot,
      pct: Math.round((100 * d.tot) / (max || 1)),
    }));
  }, [allAn]);
  var pilTop = (0, Q.useMemo)(
    () =>
      allAn
        .filter((r) => !r.vide)
        .sort((x2, y2) => (y2.net_a_payer || 0) - (x2.net_a_payer || 0))
        .slice(0, 5),
    [allAn],
  );
  var pilModes = (0, Q.useMemo)(() => {
    var m = {};
    allAn
      .filter((r) => !r.vide)
      .forEach((r) => {
        var md = r.mode_paie || `—`;
        m[md] = (m[md] || 0) + 1;
      });
    return Object.keys(m)
      .map((md) => ({ mode: md, n: m[md] }))
      .sort((x2, y2) => y2.n - x2.n);
  }, [allAn]);
  var paChip = (statut) =>
    (0, $.jsx)(T, {
      label: (PA_ST[statut] || [statut])[0],
      size: `small`,
      color: (PA_ST[statut] || [statut, `default`])[1],
      variant: (PA_ST[statut] || [statut, `outlined`])[2],
      sx: { fontWeight: 700, fontSize: `0.68rem` },
    });
  var fTh = (label, key, align) =>
    (0, $.jsx)(
      v,
      {
        align: align || `left`,
        sx: {
          fontWeight: 700,
          whiteSpace: `nowrap`,
          bgcolor: `background.default`,
        },
        children: key
          ? (0, $.jsxs)(a, {
              sx: {
                display: `inline-flex`,
                alignItems: `center`,
                gap: 0.5,
                cursor: `pointer`,
                userSelect: `none`,
                "&:hover": { color: `primary.main` },
              },
              onClick: () => fTri(key),
              children: [
                label,
                tri.key === key
                  ? (0, $.jsx)(tri.dir === `asc` ? AU : AD, {
                      sx: { fontSize: 15, color: `primary.main` },
                    })
                  : (0, $.jsx)(a, { sx: { width: 15 } }),
              ],
            })
          : label,
      },
    );
/* — Créateur de modèles de bulletin (v6) : actions du composant PaieV2.
   Population employés = pointage ∪ planning ∪ seeds ∪ bulletins (même
   règle que paGenApplique). Aperçu = paEval réel (base registre, HS,
   absences) pour le mois courant. — */
var tplEmpIds = (function () {
  var ids = {};
  try {
    ptStore().records.forEach(function (r2) {
      ids[r2.employee_id] = 1;
    });
  } catch (err) {}
  try {
    plStore().records.forEach(function (r2) {
      ids[r2.employee_id] = 1;
    });
  } catch (err) {}
  try {
    paSeedRaw().forEach(function (r2) {
      ids[r2.employee_id] = 1;
    });
  } catch (err) {}
  paToutes().forEach(function (r2) {
    ids[r2.employee_id] = 1;
  });
  return Object.keys(ids).sort();
})();
var tplEmpRw = function () {
  var eid = tplEmpId && tplEmpIds.indexOf(tplEmpId) >= 0 ? tplEmpId : tplEmpIds[0];
  if (!eid) return null;
  var emp = R(eid);
  if (!emp) return null;
  var e2 = paEval(eid, nowAn, nowMois, null, mt);
  return {
    id: `pa-tpl-prev`,
    employee_id: eid,
    mois: paKey(nowAn, nowMois),
    salaire_base: e2.base,
    hs_montant: e2.hsMont,
    retenue_absences: e2.retenueAbs,
    salaire_brut: e2.brut,
    jours_absents: e2.joursAbs,
    statut: `generee`,
    mode_paie: `Virement`,
    emp: emp,
  };
};
var fTplSet = function (path, v2) {
  if (!tplEd) return;
  var T2 = JSON.parse(JSON.stringify(tplEd));
  var seg = path.split(`.`);
  var o2 = T2;
  for (var i2 = 0; i2 < seg.length - 1; i2++) o2 = o2[seg[i2]];
  o2[seg[seg.length - 1]] = v2;
  setTplEd(T2);
};
var fTplRubAdd = function (type) {
  if (!tplEd) return;
  var T2 = JSON.parse(JSON.stringify(tplEd));
  var n2 = T2.rubriques.length + 1;
  T2.rubriques.push({
    code: String(1000 + n2 * 10).slice(0, 4),
    libelle: ``,
    type: type,
    formule: type === `gain` ? `base` : `ROUND(brut * 0 / 100, 0)`,
    baseLbl: ``,
    tauxLbl: ``,
  });
  setTplEd(T2);
};
var fTplRubSet = function (i2, k2, v2) {
  if (!tplEd) return;
  var T2 = JSON.parse(JSON.stringify(tplEd));
  T2.rubriques[i2][k2] = v2;
  setTplEd(T2);
};
var fTplRubMove = function (i2, d2) {
  if (!tplEd) return;
  var T2 = JSON.parse(JSON.stringify(tplEd));
  var j2 = i2 + d2;
  if (j2 < 0 || j2 >= T2.rubriques.length) return;
  var tmp = T2.rubriques[i2];
  T2.rubriques[i2] = T2.rubriques[j2];
  T2.rubriques[j2] = tmp;
  setTplEd(T2);
};
var fTplRubDel = function (i2) {
  if (!tplEd) return;
  var T2 = JSON.parse(JSON.stringify(tplEd));
  T2.rubriques.splice(i2, 1);
  setTplEd(T2);
};
var fTplExemple = function (k2) {
  var T2 = k2 === `cm` ? paTplExempleCM(mt) : k2 === `fr` ? paTplExempleFR(mt) : paTplNew(mt);
  setTplEd(T2);
  setTplSelId(``);
};
var fTplOpen = function (id) {
  if (id) {
    var T2 = (mt.modeles || []).find(function (x2) {
      return x2.id === id;
    });
    if (T2) {
      setTplEd(JSON.parse(JSON.stringify(T2)));
      setTplSelId(id);
      setDlgTpl(!0);
      return;
    }
  }
  setTplEd(paTplNew(mt));
  setTplSelId(``);
  setDlgTpl(!0);
};
var fTplSave = function () {
  if (!tplEd) return;
  var errs = paTplValide(tplEd);
  if (errs.length) {
    setSnack({ msg: `Modèle incomplet — ` + errs[0], sev: `error` });
    return;
  }
  var T2 = JSON.parse(JSON.stringify(tplEd));
  var st = paStore();
  var arr = ((st.meta && st.meta.modeles) || []).slice();
  var idx = -1;
  arr.forEach(function (x2, i2) {
    if (x2.id === T2.id) idx = i2;
  });
  if (idx >= 0) arr[idx] = T2;
  else arr.push(T2);
  st.meta = Object.assign({}, st.meta, { modeles: arr, bulModele: `custom:` + T2.id });
  paSave(st);
  setTick(tick + 1);
  setDlgTpl(!1);
  setSnack({
    msg: `Modèle « ` + T2.nom + ` » enregistré et appliqué — adaptable à tout employé.`,
    sev: `success`,
  });
  var best = null;
  ALL.forEach(function (r2) {
    if (!best || r2.mIdx > best.mIdx) best = r2;
  });
  if (best) {
    setNavIds([best.id]);
    var br2 = ALL.find(function (x2) {
      return x2.id === best.id;
    });
    if (br2) setDetail(br2);
  }
};
var fTplDel = function (id) {
  var st = paStore();
  var arr = ((st.meta && st.meta.modeles) || []).filter(function (x2) {
    return x2.id !== id;
  });
  var upd = { modeles: arr };
  if (st.meta && st.meta.bulModele === `custom:` + id) upd.bulModele = `moderne`;
  st.meta = Object.assign({}, st.meta, upd);
  paSave(st);
  setTick(tick + 1);
  if (tplSelId === id) {
    setTplSelId(``);
    setTplEd(paTplNew(mt));
  }
  setSnack({ msg: `Modèle supprimé.`, sev: `info` });
};
var tplErrs = tplEd ? paTplValide(tplEd) : [];
var pvO = tplEd
  ? {
      modele: PA_MODELES[tplEd.apparence.layout] ? tplEd.apparence.layout : `moderne`,
      accent: paAccentHex(tplEd.apparence.accent) || paAccentHex(`#1e3a8a`),
      logo: String((tplEd.entreprise && tplEd.entreprise.logoInitiales) || ``).trim().slice(0, 4),
      logoData: String((tplEd.entreprise && tplEd.entreprise.logoData) || ``),
      titre: String(tplEd.apparence.titre || ``).trim() || `Bulletin de paie`,
      patronal: tplEd.apparence.patronal !== 0,
      cumuls: tplEd.apparence.cumuls !== 0,
      mentions: tplEd.apparence.mentions !== 0,
      signature: tplEd.apparence.signature !== 0,
      mention: String(tplEd.apparence.mention || ``).trim().slice(0, 300),
    }
  : null;
var pvRw = tplEmpRw();
var pvBT = pvRw && tplEd ? paTplCalc(tplEd, pvRw) : null;
var fTplDup = function (id) {
  var T2 = (mt.modeles || []).find(function (x2) {
    return x2.id === id;
  });
  if (!T2) return;
  var C2 = JSON.parse(JSON.stringify(T2));
  C2.id = `tpl-` + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36);
  C2.nom = T2.nom + ` (copie)`;
  var st = paStore();
  st.meta = Object.assign({}, st.meta, {
    modeles: ((st.meta && st.meta.modeles) || []).concat([C2]),
  });
  paSave(st);
  setTick(tick + 1);
  setSnack({ msg: `Modèle dupliqué — « ` + C2.nom + ` ».`, sev: `success` });
};
  /* — Rendu principal — */
  return (0, $.jsxs)(o, {
    spacing: 2.5,
    sx: { width: `100%`, maxWidth: `100%`, minWidth: 0 },
    children: [
      (0, $.jsx)(J, {
        title: `Fiches de paie — génération depuis le temps de travail, validation & paiement`,
        subtitle:
          `Exercice ` +
          an +
          ` · ` +
          allAn.length +
          ` bulletin(s) · Salaire base (registre) + HS validées − absences (base/26) − cotisations − prêts → validation → paiement (verrou)`,
        action: (0, $.jsxs)(o, {
          direction: `row`,
          spacing: 1,
          children: [
            (0, $.jsx)(l, {
              variant: `outlined`,
              size: `small`,
              startIcon: (0, $.jsx)(RF, {}),
              onClick: () => {
                (setTick(tick + 1),
                  setSnack({
                    msg: `Bulletins recalculés depuis les sources (pointage, HS, prêts).`,
                    sev: `success`,
                  }));
              },
              sx: { textTransform: `none`, fontSize: `0.72rem` },
              children: `Recalculer`,
            }),
            (0, $.jsx)(l, {
              variant: `outlined`,
              size: `small`,
              startIcon: (0, $.jsx)(PYC, {}),
              onClick: () => {
                (setGenAn(String(new Date().getFullYear())),
                  setGenMois(String(dernierMois ? paDeKey(dernierMois).mois : nowMois)),
                  setDlgNew(!0));
              },
              sx: {
                textTransform: `none`,
                fontSize: `0.72rem`,
                borderColor: `#7e3ff2`,
                color: `#7e3ff2`,
              },
              children: `Générer les bulletins`,
            }),
            (0, $.jsx)(l, {
              variant: `outlined`,
              size: `small`,
              startIcon: (0, $.jsx)(x, {}),
              onClick: () => fTplOpen(null),
              sx: { textTransform: `none`, fontSize: `0.72rem` },
              children: `Créer un modèle`,
            }),
            (0, $.jsx)(l, {
              variant: `outlined`,
              size: `small`,
              startIcon: (0, $.jsx)(TUNE, {}),
              onClick: () => {
                (setPJl(String(mt.jourLimite)),
                  setPTd(String(mt.tauxDefaut)),
                  setPGa(mt.genAuto ? `1` : `0`),
                  setPRaison(String(mt.empRaison || ``)),
                  setPRccm(String(mt.empRccm || ``)),
                  setPNiu(String(mt.empNiu || ``)),
                  setPCnpsEmp(String(mt.empCnpsEmp || ``)),
                  setPAdr(String(mt.empAdresse || ``)),
                  setDlgPar(!0));
              },
              sx: { textTransform: `none`, fontSize: `0.72rem` },
              children: `Paramètres`,
            }),
            (0, $.jsx)(l, {
              variant: `outlined`,
              size: `small`,
              startIcon: (0, $.jsx)(S, {}),
              onClick: fExport,
              sx: { textTransform: `none`, fontSize: `0.72rem` },
              children: `Export CSV`,
            }),
          ],
        }),
      }),
      bandAlert
        ? (0, $.jsxs)(c, {
            severity: `warning`,
            icon: (0, $.jsx)(w, {}),
            sx: { mb: 0, fontWeight: 600 },
            children: [
              bandAlert + ` `,
              (0, $.jsx)(l, {
                size: `small`,
                variant: `outlined`,
                onClick: () => {
                  (setStatutF(kpiAtt.horsDelai ? `hors_delai` : `generee`), setPage(0));
                },
                sx: { textTransform: `none`, fontSize: `0.7rem`, ml: 1 },
                children: `Traiter`,
              }),
            ],
          })
        : null,
      (0, $.jsxs)(a, {
        sx: {
          display: `grid`,
          gridTemplateColumns: { xs: `1fr 1fr`, md: `repeat(4,1fr)` },
          gap: 1.5,
        },
        children: [
          (0, $.jsx)(AbsKpi, {
            ic: AB,
            grad: moisF === dernierMois && dernierMois != null,
            actif: moisF === dernierMois && dernierMois != null,
            couleur: kpiMasse.d < 0 ? `warning.main` : `primary.main`,
            onClic: () => {
              (setMoisF(dernierMois || `tous`),
                setPage(0),
                setSnack({
                  msg: dernierMois
                    ? `Zoom sur le dernier mois complet : ` + paMoisCourt(dernierMois)
                    : `Aucun mois généré`,
                  sev: `info`,
                }));
            },
            valeur: kpiMasse.tot ? paFmt(kpiMasse.tot) : `—`,
            label: `Masse salariale nette — dernier mois complet`,
            sub: dernierMois
              ? paMoisCourt(dernierMois) +
                ` · ` +
                kpiMasse.n +
                ` bulletin(s) · ` +
                (kpiMasse.d > 0 ? `▲ +` : kpiMasse.d < 0 ? `▼ ` : `= `) +
                Math.abs(kpiMasse.d) +
                ` % vs mois précédent`
              : `Générez les premiers bulletins`,
          }),
          (0, $.jsx)(AbsKpi, {
            ic: RCPT,
            grad: !1,
            actif: statutF === `generee` || statutF === `rejetee`,
            couleur: kpiAtt.horsDelai ? `error.main` : `warning.main`,
            onClic: () => {
              (setStatutF(statutF === `generee` || statutF === `rejetee` ? `tous` : `generee`),
                setPage(0));
            },
            valeur: String(kpiAtt.n),
            label: `Bulletins à valider / rejetés`,
            sub: kpiAtt.horsDelai
              ? kpiAtt.horsDelai + ` au-delà du jour limite (J+` + mt.jourLimite + `)`
              : `Objectif 3 : générés avant le 5 du mois`,
          }),
          (0, $.jsx)(AbsKpi, {
            ic: PYC,
            grad: !1,
            actif: statutF === `payee`,
            couleur: `success.main`,
            onClic: () => {
              (setStatutF(statutF === `payee` ? `tous` : `payee`), setPage(0));
            },
            valeur: kpiPaye.tot ? paFmt(kpiPaye.tot) : `0 FCFA`,
            label: `Total payé — exercice ` + an,
            sub: kpiPaye.n + ` bulletin(s) payé(s) · export comptabilité disponible`,
          }),
          (0, $.jsx)(AbsKpi, {
            ic: AS2,
            grad: !1,
            actif: statutF === `hors_delai`,
            couleur: kpiCouvr.pct >= 100 ? `success.main` : `error.main`,
            onClic: () => {
              (setStatutF(statutF === `hors_delai` ? `tous` : `hors_delai`), setPage(0));
            },
            valeur: kpiCouvr.pct + ` %`,
            label: `Couverture génération — exercice ` + an,
            sub:
              kpiCouvr.generes +
              ` / ` +
              kpiCouvr.attendus +
              ` bulletins attendus générés (Objectif 3)`,
          }),
        ],
      }),
      selCount
        ? (0, $.jsxs)(ee, {
            sx: {
              p: 1,
              borderRadius: 2,
              bgcolor: `rgba(126,63,242,.06)`,
              border: `1px solid rgba(126,63,242,.35)`,
            },
            children: (0, $.jsxs)(a, {
              sx: {
                display: `flex`,
                alignItems: `center`,
                gap: 1,
                flexWrap: `wrap`,
              },
              children: [
                (0, $.jsx)(i, {
                  variant: `body2`,
                  fontWeight: 800,
                  sx: { color: `#7e3ff2` },
                  children:
                    selCount +
                    ` bulletin(s) sélectionné(s) (non payés de la page)`,
                }),
                (0, $.jsx)(l, {
                  variant: `outlined`,
                  size: `small`,
                  onClick: () => fValider(Object.keys(sel)),
                  sx: { textTransform: `none`, fontSize: `0.75rem` },
                  children: `Valider la sélection`,
                }),
                (0, $.jsx)(l, {
                  variant: `outlined`,
                  size: `small`,
                  onClick: () =>
                    fOuvrirPayer(
                      srt.filter((r) => sel[r.id]),
                    ),
                  sx: { textTransform: `none`, fontSize: `0.75rem` },
                  children: `Payer la sélection…`,
                }),
                (0, $.jsx)(l, {
                  size: `small`,
                  onClick: () => {
                    (setDlgRej({ lot: !0 }), setMotRej(``));
                  },
                  sx: { textTransform: `none`, fontSize: `0.75rem`, color: `error.main` },
                  children: `Rejeter…`,
                }),
                (0, $.jsx)(l, {
                  size: `small`,
                  onClick: () => setSel({}),
                  sx: { textTransform: `none`, fontSize: `0.75rem` },
                  children: `Annuler`,
                }),
              ],
            }),
          })
        : null,
      (0, $.jsx)(ee, {
        sx: { p: 1.5, borderRadius: 3 },
        children: (0, $.jsxs)(o, {
          direction: { xs: `column`, md: `row` },
          spacing: 1.2,
          sx: { alignItems: { md: `center` } },
          children: [
            (0, $.jsx)(D, {
              size: `small`,
              placeholder: `Rechercher (nom, matricule, mois, référence…)`,
              value: rech,
              onChange: (e2) => {
                (setRech(e2.target.value), setPage(0));
              },
              sx: {
                flex: 2,
                minWidth: 0,
                "& .MuiInput-root": { fontSize: `0.8rem` },
              },
            }),
            (0, $.jsxs)(D, {
              select: !0,
              size: `small`,
              label: `Département`,
              value: dept,
              onChange: (e2) => {
                (setDept(e2.target.value), setPage(0));
              },
              sx: {
                minWidth: 150,
                "& .MuiInput-root": { fontSize: `0.78rem` },
              },
              children: [
                (0, $.jsx)(s, { value: `tous`, children: `Tous départements` }),
                depts.map((d2) => (0, $.jsx)(s, { value: d2, children: d2 }, d2)),
              ],
            }),
            (0, $.jsxs)(D, {
              select: !0,
              size: `small`,
              label: `Statut / alerte`,
              value: statutF,
              onChange: (e2) => {
                (setStatutF(e2.target.value), setPage(0));
              },
              sx: {
                minWidth: 175,
                "& .MuiInput-root": { fontSize: `0.78rem` },
              },
              children: [
                (0, $.jsx)(s, { value: `tous`, children: `Tous statuts` }),
                (0, $.jsx)(s, { value: `generee`, children: `Générés à valider` }),
                (0, $.jsx)(s, { value: `validee`, children: `Validés à payer` }),
                (0, $.jsx)(s, { value: `payee`, children: `Payés` }),
                (0, $.jsx)(s, { value: `rejetee`, children: `Rejetés` }),
                (0, $.jsx)(s, {
                  value: `hors_delai`,
                  children: `⚠ Au-delà du jour limite`,
                }),
                (0, $.jsx)(s, { value: `hs`, children: `⚠ Avec heures supp.` }),
                (0, $.jsx)(s, { value: `pret`, children: `⚠ Avec retenue prêt` }),
              ],
            }),
            (0, $.jsxs)(D, {
              select: !0,
              size: `small`,
              label: `Mois`,
              value: moisF,
              onChange: (e2) => {
                (setMoisF(e2.target.value), setPage(0));
              },
              sx: {
                minWidth: 140,
                "& .MuiInput-root": { fontSize: `0.78rem` },
              },
              children: [
                (0, $.jsx)(s, { value: `tous`, children: `Tous les mois` }),
                moisList.map((mk) =>
                  (0, $.jsx)(s, { value: mk, children: paMoisCourt(mk) }, mk),
                ),
              ],
            }),
            (0, $.jsxs)(D, {
              select: !0,
              size: `small`,
              label: `Exercice`,
              value: an,
              onChange: (e2) => {
                (setAn(e2.target.value), setMoisF(`tous`), setPage(0));
              },
              sx: {
                minWidth: 105,
                "& .MuiInput-root": { fontSize: `0.78rem` },
              },
              children: (() => {
                var set = {};
                paToutes().forEach((r) => {
                  var k = paDeKey(r.mois);
                  if (k) set[k.an] = 1;
                });
                return Object.keys(set)
                  .sort()
                  .reverse()
                  .map((y2) => (0, $.jsx)(s, { value: y2, children: y2 }, y2));
              })(),
            }),
          ],
        }),
      }),
      (0, $.jsx)(y, {
        sx: { borderRadius: 2, border: `1px solid`, borderColor: `divider` },
        children: (0, $.jsxs)(ne, {
          size: `small`,
          stickyHeader: !0,
          sx: { "& .MuiTableCell-root": { fontSize: `0.78rem` } },
          children: [
            (0, $.jsx)(te, {
              children: (0, $.jsxs)(b, {
                sx: { bgcolor: `background.default` },
                children: [
                  fTh(`Employé`, `emp`),
                  fTh(`Mois`, `mois`),
                  fTh(`Base`, `base`, `right`),
                  fTh(`HS`, `hs`, `right`),
                  fTh(`Brut`, `brut`, `right`),
                  fTh(`Cotisations`, `cotis`, `right`),
                  fTh(`Prêt`, `pret`, `right`),
                  fTh(`Net à payer`, `net`, `right`),
                  fTh(`Mode`, null),
                  fTh(`Statut`, `statut`),
                  (0, $.jsx)(v, {
                    align: `center`,
                    sx: { fontWeight: 700 },
                    children: `Actions`,
                  }),
                ],
              }),
            }),
            (0, $.jsxs)(_, {
              children: [
                srt.slice(page * pp, page * pp + pp).map((rw) =>
                  (0, $.jsxs)(
                    b,
                    {
                      hover: !0,
                      onClick: () => fToggle(rw),
                      sx: {
                        cursor: rw.statut === `payee` ? `default` : `pointer`,
                        bgcolor: sel[rw.id] ? `rgba(126,63,242,.08)` : undefined,
                      },
                      children: [
                        (0, $.jsx)(v, {
                          children: (0, $.jsxs)(a, {
                            sx: {
                              display: `flex`,
                              alignItems: `center`,
                              gap: 1.2,
                              minWidth: 0,
                            },
                            children: [
                              (0, $.jsx)(a, {
                                sx: {
                                  width: 32,
                                  height: 32,
                                  borderRadius: `50%`,
                                  bgcolor: `rgba(126,63,242,.12)`,
                                  color: `#7e3ff2`,
                                  display: `flex`,
                                  alignItems: `center`,
                                  justifyContent: `center`,
                                  fontWeight: 800,
                                  fontSize: `0.72rem`,
                                  flexShrink: 0,
                                },
                                children: rw.emp
                                  ? B(rw.emp)
                                      .split(` `)
                                      .map((w2) => w2[0])
                                      .join(``)
                                      .slice(0, 2)
                                      .toUpperCase()
                                  : `?`,
                              }),
                              (0, $.jsxs)(a, {
                                sx: { minWidth: 0 },
                                children: [
                                  (0, $.jsx)(i, {
                                    variant: `body2`,
                                    fontWeight: 700,
                                    noWrap: !0,
                                    children: rw.emp ? B(rw.emp) : rw.employee_id,
                                  }),
                                  (0, $.jsx)(i, {
                                    variant: `caption`,
                                    color: `text.secondary`,
                                    noWrap: !0,
                                    children:
                                      ((rw.emp && rw.emp.matricule) || rw.employee_id) +
                                      ` · ` +
                                      rw.dept,
                                  }),
                                ],
                              }),
                            ],
                          }),
                        }),
                        (0, $.jsx)(v, { children: paMoisCourt(rw.mois) }),
                        (0, $.jsx)(v, {
                          align: `right`,
                          children: (0, $.jsx)(Y, { value: rw.salaire_base || 0 }),
                        }),
                        (0, $.jsx)(v, {
                          align: `right`,
                          children:
                            rw.hs_montant > 0
                              ? (0, $.jsx)(i, {
                                  variant: `body2`,
                                  fontWeight: 700,
                                  color: `info.main`,
                                  children: paFmt(rw.hs_montant),
                                })
                              : (0, $.jsx)(i, {
                                  variant: `body2`,
                                  color: `text.disabled`,
                                  children: `—`,
                                }),
                        }),
                        (0, $.jsx)(v, {
                          align: `right`,
                          children: (0, $.jsx)(Y, { value: rw.salaire_brut || 0 }),
                        }),
                        (0, $.jsx)(v, {
                          align: `right`,
                          children: (0, $.jsxs)(a, {
                            children: [
                              (0, $.jsx)(Y, { value: rw.cotisations || 0 }),
                              (0, $.jsx)(i, {
                                variant: `caption`,
                                color: `text.secondary`,
                                sx: { display: `block` },
                                children: rw.taux_charges + ` %`,
                              }),
                            ],
                          }),
                        }),
                        (0, $.jsx)(v, {
                          align: `right`,
                          children:
                            rw.pret_retenue > 0
                              ? (0, $.jsx)(i, {
                                  variant: `body2`,
                                  color: `error.main`,
                                  children: `-` + paFmt(rw.pret_retenue),
                                })
                              : (0, $.jsx)(i, {
                                  variant: `body2`,
                                  color: `text.disabled`,
                                  children: `—`,
                                }),
                        }),
                        (0, $.jsx)(v, {
                          align: `right`,
                          children: (0, $.jsx)(i, {
                            variant: `body2`,
                            fontWeight: 800,
                            sx: { fontFamily: `monospace` },
                            children: paFmt(rw.net_a_payer || 0),
                          }),
                        }),
                        (0, $.jsx)(v, {
                          children: (0, $.jsx)(T, {
                            label: rw.mode_paie || `—`,
                            size: `small`,
                            variant: `outlined`,
                            sx: { fontSize: `0.65rem` },
                          }),
                        }),
                        (0, $.jsxs)(v, {
                          children: [
                            paChip(rw.statut),
                            rw.horsDelai
                              ? (0, $.jsx)(i, {
                                  variant: `caption`,
                                  sx: {
                                    display: `block`,
                                    color: `warning.main`,
                                    fontWeight: 700,
                                    mt: 0.5,
                                  },
                                  children: `hors délai (J+` + mt.jourLimite + `)`,
                                })
                              : rw.statut === `payee` && rw.paye_le
                                ? (0, $.jsx)(i, {
                                    variant: `caption`,
                                    sx: {
                                      display: `block`,
                                      color: `text.secondary`,
                                      mt: 0.5,
                                    },
                                    children: `payé le ` + rw.paye_le,
                                  })
                                : rw.statut === `validee` && rw.valide_le
                                  ? (0, $.jsx)(i, {
                                      variant: `caption`,
                                      sx: {
                                        display: `block`,
                                        color: `text.secondary`,
                                        mt: 0.5,
                                      },
                                      children: `validé le ` + rw.valide_le,
                                    })
                                  : null,
                          ],
                        }),
                        (0, $.jsx)(v, {
                          children: (0, $.jsxs)(a, {
                            sx: {
                              display: `flex`,
                              gap: 0.5,
                              alignItems: `center`,
                              flexWrap: `wrap`,
                              minWidth: 190,
                            },
                            children: [
                              (0, $.jsx)(l, {
                                size: `small`,
                                onClick: (e2) => {
                                  (e2.stopPropagation(), setNavIds(srt.map((x2) => x2.id)), setDetail(rw));
                                },
                                sx: { minWidth: 0, px: 1 },
                                title: `Bulletin détaillé`,
                                children: (0, $.jsx)(C, {
                                  sx: { fontSize: 18 },
                                }),
                              }),
                              rw.statut === `generee` || rw.statut === `rejetee`
                                ? (0, $.jsx)(l, {
                                    size: `small`,
                                    variant: `outlined`,
                                    onClick: (e2) => {
                                      (e2.stopPropagation(), fValider([rw.id]));
                                    },
                                    sx: {
                                      textTransform: `none`,
                                      fontSize: `0.68rem`,
                                      minWidth: 0,
                                      px: 1,
                                      color: `success.main`,
                                      borderColor: `success.main`,
                                    },
                                    children: `Valider`,
                                  })
                                : null,
                              rw.statut === `validee`
                                ? (0, $.jsx)(l, {
                                    size: `small`,
                                    variant: `outlined`,
                                    onClick: (e2) => {
                                      (e2.stopPropagation(), fOuvrirPayer([rw]));
                                    },
                                    sx: {
                                      textTransform: `none`,
                                      fontSize: `0.68rem`,
                                      minWidth: 0,
                                      px: 1,
                                      color: `info.main`,
                                      borderColor: `info.main`,
                                    },
                                    children: `Payer`,
                                  })
                                : null,
                              rw.statut === `generee` || rw.statut === `validee`
                                ? (0, $.jsx)(l, {
                                    size: `small`,
                                    onClick: (e2) => {
                                      (e2.stopPropagation(),
                                        setMotRej(``),
                                        setDlgRej(rw));
                                    },
                                    sx: {
                                      textTransform: `none`,
                                      fontSize: `0.68rem`,
                                      minWidth: 0,
                                      px: 1,
                                      color: `error.main`,
                                    },
                                    children: `Rejeter`,
                                  })
                                : null,
                              rw.statut === `rejetee` || rw.statut === `validee`
                                ? (0, $.jsx)(l, {
                                    size: `small`,
                                    onClick: (e2) => {
                                      (e2.stopPropagation(), fReOuvrir(rw));
                                    },
                                    sx: {
                                      textTransform: `none`,
                                      fontSize: `0.68rem`,
                                      minWidth: 0,
                                      px: 1,
                                    },
                                    children: `Réouvrir`,
                                  })
                                : null,
                            ],
                          }),
                        }),
                      ],
                    },
                    rw.id,
                  ),
                ),
                srt.length === 0
                  ? (0, $.jsx)(b, {
                      children: (0, $.jsx)(v, {
                        colSpan: 11,
                        align: `center`,
                        sx: { py: 4, color: `text.secondary` },
                        children:
                          `Aucun bulletin ne correspond aux filtres — utilisez « Générer les bulletins » pour le mois souhaité.`,
                      }),
                    })
                  : null,
              ],
            }),
          ],
        }),
      }),
      (0, $.jsx)(g, {
        component: `div`,
        count: srt.length,
        page: page,
        onPageChange: (e2, v2) => setPage(v2),
        rowsPerPage: pp,
        onRowsPerPageChange: (e2) => {
          (setPp(parseInt(e2.target.value, 10)), setPage(0));
        },
        rowsPerPageOptions: [10, 20, 50],
        labelRowsPerPage: `Lignes :`,
        labelDisplayedRows: (pg2) => pg2.from + `-` + pg2.to + ` sur ` + pg2.count,
        sx: { mt: -1 },
      }),
      (0, $.jsxs)(ee, {
        sx: { borderRadius: 3 },
        children: (0, $.jsxs)(u, {
          children: [
            (0, $.jsxs)(a, {
              sx: {
                display: `flex`,
                alignItems: `center`,
                gap: 1,
                mb: 1.5,
                flexWrap: `wrap`,
              },
              children: [
                (0, $.jsx)(AS2, { sx: { fontSize: 20, color: `#7e3ff2` } }),
                (0, $.jsx)(i, {
                  variant: `subtitle2`,
                  fontWeight: 800,
                  children: `Pilotage visuel — masse salariale, HS & modes de paiement`,
                }),
                (0, $.jsx)(a, {
                  sx: {
                    ml: `auto`,
                    display: `flex`,
                    alignItems: `center`,
                    gap: 1,
                  },
                  children: [
                    (0, $.jsx)(l, {
                      variant: `outlined`,
                      size: `small`,
                      startIcon: (0, $.jsx)(PYC, {}),
                      onClick: fExportCompta,
                      sx: { textTransform: `none`, fontSize: `0.7rem` },
                      children: `Exporter les bulletins payés (compta)`,
                    }),
                    (0, $.jsx)(l, {
                      size: `small`,
                      onClick: () => setCh(chOpen ? 0 : 1),
                      sx: {
                        textTransform: `none`,
                        fontSize: `0.72rem`,
                        minWidth: 0,
                      },
                      children: chOpen ? `Masquer` : `Afficher`,
                    }),
                  ],
                }),
              ],
            }),
            chOpen
              ? (0, $.jsxs)(a, {
                  sx: {
                    display: `grid`,
                    gridTemplateColumns: { xs: `1fr`, md: `1fr 1fr` },
                    gap: 3,
                    mt: 1.5,
                    overflowX: `auto`,
                  },
                  children: [
                    (0, $.jsxs)(a, {
                      children: [
                        (0, $.jsx)(i, {
                          variant: `caption`,
                          fontWeight: 800,
                          sx: {
                            color: `text.secondary`,
                            display: `block`,
                            mb: 1,
                          },
                          children: `Évolution de la masse nette — 12 derniers mois de l'exercice (violet : net · bleu : HS)`,
                        }),
                        (0, $.jsx)(a, {
                          sx: {
                            display: `flex`,
                            alignItems: `flex-end`,
                            gap: 0.5,
                            height: 96,
                            maxWidth: `100%`,
                          },
                          children: pilMois.map((v2) => {
                            var mx = Math.max.apply(
                              null,
                              pilMois.map((x2) => Math.max(x2.net, 1)),
                            );
                            return (0, $.jsxs)(
                              a,
                              {
                                title:
                                  paMoisCourt(v2.key) +
                                  ` : net ` +
                                  paFmt(v2.net) +
                                  (v2.hs ? ` · HS ` + paFmt(v2.hs) : ``),
                                sx: {
                                  flex: 1,
                                  display: `flex`,
                                  flexDirection: `column`,
                                  justifyContent: `flex-end`,
                                  alignItems: `center`,
                                  gap: 0.25,
                                  minWidth: 0,
                                },
                                children: [
                                  (0, $.jsx)(i, {
                                    variant: `caption`,
                                    sx: {
                                      fontSize: `0.5rem`,
                                      fontWeight: 800,
                                    },
                                    children:
                                      v2.net >= 1e6
                                        ? (Math.round(v2.net / 1e5) / 10).toFixed(1) + `M`
                                        : v2.net
                                          ? Math.round(v2.net / 1e3) + `k`
                                          : `0`,
                                  }),
                                  v2.hs > 0
                                    ? (0, $.jsx)(a, {
                                        sx: {
                                          width: `100%`,
                                          height: Math.max(
                                            2,
                                            Math.round((v2.hs / mx) * 22),
                                          ),
                                          bgcolor: `info.main`,
                                          borderRadius: `2px 2px 0 0`,
                                        },
                                      })
                                    : null,
                                  (0, $.jsx)(a, {
                                    sx: {
                                      width: `100%`,
                                      height: Math.max(3, Math.round((v2.net / mx) * 56)),
                                      bgcolor: v2.net === 0 ? `text.disabled` : `#7e3ff2`,
                                      borderRadius: `3px 3px 0 0`,
                                    },
                                  }),
                                  (0, $.jsx)(i, {
                                    variant: `caption`,
                                    sx: {
                                      fontSize: `0.5rem`,
                                      color: `text.secondary`,
                                    },
                                    children: v2.lbl,
                                  }),
                                ],
                              },
                              v2.key,
                            );
                          }),
                        }),
                      ],
                    }),
                    (0, $.jsxs)(a, {
                      children: [
                        (0, $.jsx)(i, {
                          variant: `caption`,
                          fontWeight: 800,
                          sx: {
                            color: `text.secondary`,
                            display: `block`,
                            mb: 1,
                          },
                          children: `Masse nette par département — exercice ` + an + ` (cliquer pour filtrer)`,
                        }),
                        (0, $.jsx)(a, {
                          sx: { display: `flex`, flexDirection: `column`, gap: 0.75 },
                          children: pilDept.map((d2) =>
                            (0, $.jsxs)(
                              a,
                              {
                                onClick: () => {
                                  (setDept(d2.dept), setPage(0));
                                },
                                title:
                                  d2.dept + ` : ` + paFmt(d2.tot) + ` — cliquer pour filtrer`,
                                sx: {
                                  cursor: `pointer`,
                                  "&:hover": { opacity: 0.85 },
                                },
                                children: [
                                  (0, $.jsxs)(a, {
                                    sx: {
                                      display: `flex`,
                                      justifyContent: `space-between`,
                                      fontSize: `0.68rem`,
                                    },
                                    children: [
                                      (0, $.jsx)(i, {
                                        variant: `caption`,
                                        fontWeight: dept === d2.dept ? 800 : 600,
                                        color:
                                          dept === d2.dept ? `#7e3ff2` : `text.primary`,
                                        children: d2.dept,
                                      }),
                                      (0, $.jsx)(i, {
                                        variant: `caption`,
                                        children: paFmt(d2.tot),
                                      }),
                                    ],
                                  }),
                                  (0, $.jsx)(X, {
                                    value: d2.pct,
                                    max: 100,
                                    label: d2.pct + ` %`,
                                  }),
                                ],
                              },
                              d2.dept,
                            ),
                          ),
                        }),
                      ],
                    }),
                    (0, $.jsxs)(a, {
                      children: [
                        (0, $.jsx)(i, {
                          variant: `caption`,
                          fontWeight: 800,
                          sx: {
                            color: `text.secondary`,
                            display: `block`,
                            mb: 1,
                          },
                          children: `Top 5 nets à payer — exercice ` + an,
                        }),
                        (0, $.jsx)(a, {
                          sx: { display: `flex`, flexDirection: `column`, gap: 0.5 },
                          children: pilTop.map((r, idx) =>
                            (0, $.jsxs)(
                              a,
                              {
                                onClick: () => setDetail(r),
                                sx: {
                                  display: `flex`,
                                  alignItems: `center`,
                                  gap: 1,
                                  cursor: `pointer`,
                                  p: 0.5,
                                  borderRadius: 1,
                                  "&:hover": { bgcolor: `action.hover` },
                                },
                                children: [
                                  (0, $.jsx)(T, {
                                    label: `#` + (idx + 1),
                                    size: `small`,
                                    sx: { fontWeight: 800, fontSize: `0.6rem` },
                                    color: idx === 0 ? `warning` : `default`,
                                  }),
                                  (0, $.jsx)(i, {
                                    variant: `caption`,
                                    fontWeight: 700,
                                    sx: { flex: 1, minWidth: 0, noWrap: !0 },
                                    noWrap: !0,
                                    children:
                                      (r.emp ? B(r.emp) : r.employee_id) +
                                      ` · ` +
                                      paMoisCourt(r.mois),
                                  }),
                                  (0, $.jsx)(i, {
                                    variant: `caption`,
                                    fontWeight: 800,
                                    sx: { fontFamily: `monospace` },
                                    children: paFmt(r.net_a_payer || 0),
                                  }),
                                ],
                              },
                              r.id,
                            ),
                          ),
                        }),
                      ],
                    }),
                    (0, $.jsxs)(a, {
                      children: [
                        (0, $.jsx)(i, {
                          variant: `caption`,
                          fontWeight: 800,
                          sx: {
                            color: `text.secondary`,
                            display: `block`,
                            mb: 1,
                          },
                          children: `Modes de paiement — exercice ` + an,
                        }),
                        (0, $.jsx)(a, {
                          sx: {
                            display: `flex`,
                            gap: 1,
                            flexWrap: `wrap`,
                          },
                          children: pilModes.map((md) =>
                            (0, $.jsx)(T, {
                              label: md.mode + ` · ` + md.n,
                              size: `small`,
                              variant: `outlined`,
                              onClick: () => {
                                setRech(md.mode);
                                setPage(0);
                              },
                              sx: {
                                fontWeight: 700,
                                fontSize: `0.68rem`,
                                cursor: `pointer`,
                              },
                            }, md.mode),
                          ),
                        }),
                        (0, $.jsx)(i, {
                          variant: `caption`,
                          sx: { display: `block`, mt: 1, color: `text.secondary` },
                          children:
                            `Retenues de prêts : mensualités « en remboursement » de l'écran Prêts & avances — déduites automatiquement au net.`,
                        }),
                      ],
                    }),
                  ],
                })
              : null,
          ],
        }),
      }),
      (0, $.jsx)(f, {
        open: detail != null,
        onClose: () => setDetail(null),
        maxWidth: `lg`,
        fullWidth: !0,
        PaperProps: { sx: { maxWidth: 940 } },
        children:
          detail
            ? (function () {
                var O = paBulOpts(mt);
                var navIdx = navIds ? navIds.indexOf(detail.id) : -1;
                var fNavGo = function (dir) {
                  if (!navIds || navIdx < 0) return;
                  var nid = navIds[navIdx + dir];
                  if (!nid) return;
                  var nr = ALL.find(function (x2) { return x2.id === nid; });
                  if (nr) setDetail(nr);
                };
                var fSetModele = function (mk) {
                  var st = paStore();
                  st.meta = Object.assign({}, st.meta, { bulModele: mk });
                  paSave(st);
                  setTick(tick + 1);
                };
                var fOuvrirBul = function () {
                  setPbModele(O.modele);
                  setPbAccent(paAccentHex(mt.bulAccent) ? mt.bulAccent : `#1e3a8a`);
                  setPbLogo(mt.bulLogo || ``);
                  setPbTitre(mt.bulTitre || ``);
                  setPbPatronal(mt.bulPatronal !== 0 ? `1` : `0`);
                  setPbCumuls(mt.bulCumuls !== 0 ? `1` : `0`);
                  setPbMentions(mt.bulMentions !== 0 ? `1` : `0`);
                  setPbSignature(mt.bulSignature !== 0 ? `1` : `0`);
                  setPbMention(mt.bulMention || ``);
                  setDlgBul(!0);
                };
                var BT = paBulData(detail, mt);
                var BTK = O.tpl ? paTplCalc(O.tpl, detail) : null;
                return (0, $.jsxs)(a, {
                  children: [
                    (0, $.jsxs)(a, {
                      sx: {
                        display: `flex`,
                        gap: 0.75,
                        alignItems: `center`,
                        px: 2.5,
                        pt: 1.5,
                        pb: 1,
                        flexWrap: `wrap`,
                      },
                      children: [
                        (0, $.jsx)(i, {
                          variant: `caption`,
                          sx: {
                            fontWeight: 800,
                            color: `text.secondary`,
                            textTransform: `uppercase`,
                            letterSpacing: 0.5,
                            mr: 0.5,
                          },
                          children: `Modèle :`,
                        }),
                        Object.keys(PA_MODELES).map(function (mk) {
                          return (0, $.jsx)(
                            l,
                            {
                              size: `small`,
                              variant: !O.tpl && O.modele === mk ? `contained` : `outlined`,
                              onClick: function () { fSetModele(mk); },
                              title: PA_MODELES[mk].desc,
                              sx: {
                                textTransform: `none`,
                                fontSize: `0.72rem`,
                                minWidth: 0,
                                px: 1.2,
                                bgcolor: !O.tpl && O.modele === mk ? `#7e3ff2` : ``,
                                borderColor: !O.tpl && O.modele === mk ? `#7e3ff2` : ``,
                              },
                              children: PA_MODELES[mk].nom,
                            },
                            mk
                          );
                        }),
                        (mt.modeles || []).map(function (t2) {
                          var act = !!(O.tpl && O.tpl.id === t2.id);
                          return (0, $.jsx)(
                            l,
                            {
                              size: `small`,
                              variant: act ? `contained` : `outlined`,
                              onClick: function () { fSetModele(`custom:` + t2.id); },
                              title: `Modèle personnalisé — ` + t2.nom,
                              sx: {
                                textTransform: `none`,
                                fontSize: `0.72rem`,
                                minWidth: 0,
                                px: 1.2,
                                bgcolor: act ? `#7e3ff2` : ``,
                                borderColor: act ? `#7e3ff2` : ``,
                              },
                              children: t2.nom,
                            },
                            t2.id
                          );
                        }),
                        (0, $.jsx)(l, {
                          size: `small`,
                          startIcon: (0, $.jsx)(x, { sx: { fontSize: 15 } }),
                          onClick: function () { fTplOpen(null); },
                          sx: { textTransform: `none`, fontSize: `0.72rem` },
                          children: `Créer un modèle`,
                        }),
                        (0, $.jsx)(l, {
                          size: `small`,
                          startIcon: (0, $.jsx)(TUNE, { sx: { fontSize: 15 } }),
                          onClick: fOuvrirBul,
                          sx: { textTransform: `none`, fontSize: `0.72rem` },
                          children: `Personnaliser`,
                        }),
                        (0, $.jsx)(a, { sx: { flex: 1 } }),
                        navIds && navIds.length > 1 && navIdx >= 0
                          ? (0, $.jsxs)(a, {
                              sx: { display: `flex`, gap: 0.5, alignItems: `center` },
                              children: [
                                (0, $.jsx)(l, {
                                  size: `small`,
                                  disabled: navIdx <= 0,
                                  onClick: function () { fNavGo(-1); },
                                  sx: { minWidth: 0, px: 1, fontSize: `1rem` },
                                  title: `Bulletin précédent`,
                                  children: `‹`,
                                }),
                                (0, $.jsx)(i, {
                                  variant: `caption`,
                                  sx: { fontWeight: 800, whiteSpace: `nowrap` },
                                  children: navIdx + 1 + ` / ` + navIds.length,
                                }),
                                (0, $.jsx)(l, {
                                  size: `small`,
                                  disabled: navIdx >= navIds.length - 1,
                                  onClick: function () { fNavGo(1); },
                                  sx: { minWidth: 0, px: 1, fontSize: `1rem` },
                                  title: `Bulletin suivant`,
                                  children: `›`,
                                }),
                              ],
                            })
                          : null,
                      ],
                    }),
                    (0, $.jsx)(`style`, {
                      dangerouslySetInnerHTML: { __html: paBulCSS(`dialog`, O) },
                    }),
                    (0, $.jsx)(p, {
                      sx: { p: 0, bgcolor: `#eef1f5` },
                      children: (0, $.jsx)(a, {
                        className: `paBulBox`,
                        dangerouslySetInnerHTML: {
                          __html: O.tpl ? paTplBody(BTK, detail, O, O.tpl) : paBulBody(BT, detail, O),
                        },
                      }),
                    }),
                    (0, $.jsxs)(m, {
                      sx: { px: 3, pb: 2, pt: 1 },
                      children: [
                        (0, $.jsx)(l, {
                          variant: `outlined`,
                          startIcon: (0, $.jsx)(RCPT, { sx: { fontSize: 18 } }),
                          onClick: () => {
                            var html = paBulletinHTML(detail, mt);
                            var w2 = window.open(``, `_blank`);
                            if (!w2) {
                              setSnack({
                                msg: `Impression bloquée — autorisez les fenêtres pop-up pour imprimer / enregistrer le bulletin en PDF.`,
                                sev: `warning`,
                              });
                              return;
                            }
                            w2.document.open();
                            w2.document.write(html);
                            w2.document.close();
                            w2.focus();
                            w2.print();
                          },
                          sx: { textTransform: `none` },
                          children: `Imprimer / PDF`,
                        }),
                        detail.statut === `generee` || detail.statut === `rejetee`
                          ? (0, $.jsx)(l, {
                              variant: `outlined`,
                              onClick: () => {
                                (fValider([detail.id]), setDetail(null));
                              },
                              sx: { textTransform: `none` },
                              children: `Valider`,
                            })
                          : null,
                        detail.statut === `validee`
                          ? (0, $.jsx)(l, {
                              variant: `contained`,
                              onClick: () => {
                                (fOuvrirPayer([detail]), setDetail(null));
                              },
                              sx: { bgcolor: `#7e3ff2`, textTransform: `none` },
                              children: `Payer`,
                            })
                          : null,
                        (0, $.jsx)(l, {
                          onClick: () => setDetail(null),
                          children: `Fermer`,
                        }),
                      ],
                    }),
                  ],
                });
              })()
            : null,
      }),
      (0, $.jsx)(f, {
        open: dlgNew,
        onClose: () => setDlgNew(!1),
        maxWidth: `xs`,
        fullWidth: !0,
        children: (0, $.jsxs)(a, {
          children: [
            (0, $.jsxs)(h, {
              sx: { fontWeight: 800, display: `flex`, alignItems: `center`, gap: 1 },
              children: [
                (0, $.jsx)(PYC, { sx: { color: `#7e3ff2` } }),
                `Générer les bulletins de paie`,
              ],
            }),
            (0, $.jsxs)(p, {
              sx: { display: `flex`, flexDirection: `column`, gap: 2 },
              children: [
                (0, $.jsxs)(D, {
                  select: !0,
                  size: `small`,
                  label: `Exercice`,
                  value: genAn,
                  onChange: (e2) => setGenAn(e2.target.value),
                  sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                  children: (() => {
                    var set = { 2025: 1, 2026: 1, 2027: 1 };
                    return Object.keys(set)
                      .sort()
                      .reverse()
                      .map((y2) => (0, $.jsx)(s, { value: y2, children: y2 }, y2));
                  })(),
                }),
                (0, $.jsxs)(D, {
                  select: !0,
                  size: `small`,
                  label: `Mois`,
                  value: genMois,
                  onChange: (e2) => setGenMois(e2.target.value),
                  sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                  children: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((mo) =>
                    (0, $.jsx)(s, { value: String(mo), children: hsMoisLabel(mo) }, mo),
                  ),
                }),
                (0, $.jsx)(i, {
                  variant: `caption`,
                  sx: { color: `text.secondary` },
                  children:
                    `Chaque bulletin = salaire de base (registre) + HS validées du mois − retenue absences (base/26) − cotisations au taux contractuel − mensualités de prêts en remboursement. Les bulletins validés ou payés ne sont JAMAIS écrasés.`,
                }),
              ],
            }),
            (0, $.jsxs)(m, {
              sx: { px: 3, pb: 2 },
              children: [
                (0, $.jsx)(l, {
                  onClick: () => setDlgNew(!1),
                  children: `Annuler`,
                }),
                (0, $.jsx)(l, {
                  variant: `contained`,
                  onClick: fGen,
                  sx: { bgcolor: `#7e3ff2`, textTransform: `none` },
                  children: `Générer`,
                }),
              ],
            }),
          ],
        }),
      }),
      (0, $.jsx)(f, {
        open: dlgPay != null,
        onClose: () => setDlgPay(null),
        maxWidth: `xs`,
        fullWidth: !0,
        children: (0, $.jsxs)(a, {
          children: [
            (0, $.jsxs)(h, {
              sx: { fontWeight: 800, display: `flex`, alignItems: `center`, gap: 1 },
              children: [
                (0, $.jsx)(PYC, { sx: { color: `#7e3ff2` } }),
                `Paiement de ` +
                  (dlgPay && dlgPay.length === 1
                    ? `1 bulletin`
                    : dlgPay
                      ? dlgPay.length + ` bulletins`
                      : `—`),
              ],
            }),
            (0, $.jsxs)(p, {
              sx: { display: `flex`, flexDirection: `column`, gap: 2 },
              children: [
                dlgPay && dlgPay.length
                  ? (0, $.jsx)(i, {
                      variant: `body2`,
                      sx: { fontWeight: 700 },
                      children:
                        dlgPay
                          .map((r) => (r.emp ? B(r.emp) : r.employee_id))
                          .slice(0, 4)
                          .join(`, `) +
                        (dlgPay.length > 4 ? ` +` + (dlgPay.length - 4) : ``) +
                        ` · ` +
                        paFmt(
                          dlgPay.reduce((s2, r) => s2 + (r.net_a_payer || 0), 0),
                        ),
                    })
                  : null,
                (0, $.jsxs)(D, {
                  select: !0,
                  size: `small`,
                  label: `Mode de paiement`,
                  value: payMode,
                  onChange: (e2) => setPayMode(e2.target.value),
                  sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                  children: PA_MODES.map((md) =>
                    (0, $.jsx)(s, { value: md, children: md }, md),
                  ),
                }),
                (0, $.jsx)(D, {
                  size: `small`,
                  label: `Référence du paiement`,
                  value: payRef,
                  onChange: (e2) => setPayRef(e2.target.value),
                  helperText: `Tracée dans l'export comptabilité (référence du lot ou du virement).`,
                  sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                }),
                (0, $.jsx)(i, {
                  variant: `caption`,
                  sx: { color: `text.secondary` },
                  children:
                    `Le paiement VERROUILLE les bulletins (statut payé, non modifiable) — ils alimentent le KPI « Total payé » et l'export comptabilité.`,
                }),
              ],
            }),
            (0, $.jsxs)(m, {
              sx: { px: 3, pb: 2 },
              children: [
                (0, $.jsx)(l, {
                  onClick: () => setDlgPay(null),
                  children: `Annuler`,
                }),
                (0, $.jsx)(l, {
                  variant: `contained`,
                  color: `primary`,
                  onClick: fConfPayer,
                  sx: { textTransform: `none` },
                  children: `Confirmer le paiement`,
                }),
              ],
            }),
          ],
        }),
      }),
      (0, $.jsx)(f, {
        open: dlgRej != null,
        onClose: () => setDlgRej(null),
        maxWidth: `xs`,
        fullWidth: !0,
        children: (0, $.jsxs)(a, {
          children: [
            (0, $.jsx)(h, {
              sx: { fontWeight: 800 },
              children: dlgRej && dlgRej.lot
                ? `Rejeter la sélection`
                : `Rejeter le bulletin` + (dlgRej && dlgRej.emp ? ` — ` + B(dlgRej.emp) : ``),
            }),
            (0, $.jsxs)(p, {
              sx: { display: `flex`, flexDirection: `column`, gap: 2 },
              children: [
                (0, $.jsx)(i, {
                  variant: `body2`,
                  sx: { color: `text.secondary` },
                  children:
                    (dlgRej && dlgRej.lot
                      ? `Le motif s'applique à tous les bulletins sélectionnés (non payés). `
                      : ``) +
                    `Un bulletin rejeté retourne en correction — motif OBLIGATOIRE.`,
                }),
                (0, $.jsx)(D, {
                  size: `small`,
                  multiline: !0,
                  minRows: 2,
                  label: `Motif du rejet (obligatoire)`,
                  value: motRej,
                  onChange: (e2) => setMotRej(e2.target.value),
                  sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                }),
              ],
            }),
            (0, $.jsxs)(m, {
              sx: { px: 3, pb: 2 },
              children: [
                (0, $.jsx)(l, {
                  onClick: () => {
                    (setDlgRej(null), setMotRej(``));
                  },
                  children: `Annuler`,
                }),
                (0, $.jsx)(l, {
                  variant: `contained`,
                  color: `error`,
                  onClick: () => {
                    if (dlgRej && dlgRej.lot) {
                      var ids = Object.keys(sel).filter((id) => {
                        var r = ALL.find((x) => x.id === id);
                        return r && r.statut !== `payee`;
                      });
                      if (!motRej.trim()) {
                        setSnack({ msg: `Motif de rejet OBLIGATOIRE.`, sev: `error` });
                        return;
                      }
                      var st = paStore();
                      var n2 = 0;
                      ids.forEach((id) => {
                        var r = ALL.find((x) => x.id === id);
                        if (!r) return;
                        var rec = fMater(r, st);
                        rec.statut = `rejetee`;
                        rec.motif_rejet = motRej.trim();
                        n2++;
                      });
                      paSave(st);
                      setSel({});
                      setDlgRej(null);
                      setMotRej(``);
                      setTick(tick + 1);
                      setSnack({
                        msg: n2 + ` bulletin(s) rejeté(s) — correction attendue.`,
                        sev: `warning`,
                      });
                    } else fConfRejeter();
                  },
                  sx: { textTransform: `none` },
                  children: `Rejeter`,
                }),
              ],
            }),
          ],
        }),
      }),
      (0, $.jsx)(f, {
        open: dlgPar,
        onClose: () => setDlgPar(!1),
        maxWidth: `sm`,
        fullWidth: !0,
        children: (0, $.jsxs)(a, {
          children: [
            (0, $.jsx)(h, {
              sx: { fontWeight: 800 },
              children: `Paramètres de la paie`,
            }),
            (0, $.jsxs)(p, {
              sx: { display: `flex`, flexDirection: `column`, gap: 2 },
              children: [
                (0, $.jsx)(D, {
                  size: `small`,
                  type: `number`,
                  label: `Jour limite de génération (J+ n du mois suivant)`,
                  value: pJl,
                  onChange: (e2) => setPJl(e2.target.value),
                  helperText: `Objectif 3 : bulletins générés avant le 5 du mois — au-delà, alerte « hors délai » (bandeau, KPI, filtres).`,
                  sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                }),
                (0, $.jsx)(D, {
                  size: `small`,
                  type: `number`,
                  label: `Taux de cotisations par défaut (%)`,
                  value: pTd,
                  onChange: (e2) => setPTd(e2.target.value),
                  helperText: `Appliqué aux employés sans taux déductible du registre (règle locale : 25 % au-dessus de 100 000, 15 % en dessous).`,
                  sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                }),
                (0, $.jsxs)(D, {
                  select: !0,
                  size: `small`,
                  label: `Génération auto du mois courant`,
                  value: pGa,
                  onChange: (e2) => setPGa(e2.target.value),
                  sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                  children: [
                    (0, $.jsx)(s, { value: `1`, children: `Oui — à l'ouverture de l'écran` }),
                    (0, $.jsx)(s, { value: `0`, children: `Non — génération manuelle uniquement` }),
                  ],
                }),
                (0, $.jsx)(i, {
                  variant: `overline`,
                  sx: { color: `#7e3ff2`, fontWeight: 800, letterSpacing: 1 },
                  children: `Identité employeur (affichée sur le bulletin de paie)`,
                }),
                (0, $.jsx)(D, {
                  size: `small`,
                  label: `Raison sociale`,
                  value: pRaison,
                  onChange: (e2) => setPRaison(e2.target.value),
                  sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                }),
                (0, $.jsxs)(a, {
                  sx: { display: `grid`, gridTemplateColumns: `1fr 1fr`, gap: 2 },
                  children: [
                    (0, $.jsx)(D, {
                      size: `small`,
                      label: `RCCM`,
                      value: pRccm,
                      onChange: (e2) => setPRccm(e2.target.value),
                    }),
                    (0, $.jsx)(D, {
                      size: `small`,
                      label: `NIU / N° contribuable`,
                      value: pNiu,
                      onChange: (e2) => setPNiu(e2.target.value),
                    }),
                  ],
                }),
                (0, $.jsxs)(a, {
                  sx: { display: `grid`, gridTemplateColumns: `1fr 1fr`, gap: 2 },
                  children: [
                    (0, $.jsx)(D, {
                      size: `small`,
                      label: `N° CNPS employeur`,
                      value: pCnpsEmp,
                      onChange: (e2) => setPCnpsEmp(e2.target.value),
                    }),
                    (0, $.jsx)(D, {
                      size: `small`,
                      label: `Adresse (siège)`,
                      value: pAdr,
                      onChange: (e2) => setPAdr(e2.target.value),
                    }),
                  ],
                }),
                (0, $.jsx)(i, {
                  variant: `caption`,
                  sx: { color: `text.secondary` },
                  children:
                    `Chaîne de confiance : pointage validé → planning clôturé → bulletins générés → validation → paiement (verrou prêt compta). Les paramètres affectent KPI, alertes et filtres.`,
                }),
              ],
            }),
            (0, $.jsxs)(m, {
              sx: { px: 3, pb: 2 },
              children: [
                (0, $.jsx)(l, {
                  onClick: () => setDlgPar(!1),
                  children: `Annuler`,
                }),
                (0, $.jsx)(l, {
                  variant: `contained`,
                  onClick: fSavePar,
                  sx: { bgcolor: `#7e3ff2`, textTransform: `none` },
                  children: `Enregistrer`,
                }),
              ],
            }),
          ],
        }),
      }),
      (0, $.jsx)(f, {
        open: dlgBul,
        onClose: () => setDlgBul(!1),
        maxWidth: `sm`,
        fullWidth: !0,
        children: (0, $.jsxs)(a, {
          children: [
            (0, $.jsxs)(h, {
              sx: { fontWeight: 800, display: `flex`, alignItems: `center`, gap: 1 },
              children: [
                (0, $.jsx)(TUNE, { sx: { color: `#7e3ff2` } }),
                `Personnaliser le bulletin de paie`,
              ],
            }),
            (0, $.jsxs)(p, {
              sx: { display: `flex`, flexDirection: `column`, gap: 2 },
              children: [
                (0, $.jsxs)(D, {
                  select: !0,
                  size: `small`,
                  label: `Modèle de bulletin`,
                  value: pbModele,
                  onChange: (e2) => setPbModele(e2.target.value),
                  sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                  children: Object.keys(PA_MODELES).map((mk) =>
                    (0, $.jsx)(
                      s,
                      { value: mk, children: PA_MODELES[mk].nom + ` — ` + PA_MODELES[mk].desc },
                      mk,
                    ),
                  ),
                }),
                (0, $.jsxs)(a, {
                  sx: { display: `flex`, gap: 1, alignItems: `center`, flexWrap: `wrap` },
                  children: [
                    (0, $.jsx)(i, { variant: `caption`, sx: { fontWeight: 700 }, children: `Couleur d'accent :` }),
                    [
                      `#1e3a8a`,
                      `#7e3ff2`,
                      `#0f766e`,
                      `#b45309`,
                      `#be123c`,
                      `#334155`,
                      `#065f46`,
                      `#4338ca`,
                    ].map((c2) =>
                      (0, $.jsx)(
                        a,
                        {
                          onClick: () => setPbAccent(c2),
                          title: c2,
                          sx: {
                            width: 24,
                            height: 24,
                            borderRadius: `50%`,
                            bgcolor: c2,
                            cursor: `pointer`,
                            border: pbAccent === c2 ? `3px solid #111827` : `2px solid #fff`,
                            boxShadow: `0 0 0 1px #cbd5e1`,
                          },
                        },
                        c2,
                      ),
                    ),
                    (0, $.jsx)(D, {
                      size: `small`,
                      value: pbAccent,
                      onChange: (e2) => setPbAccent(e2.target.value),
                      sx: { width: 130, "& .MuiInput-root": { fontSize: `0.8rem` } },
                      placeholder: `#1e3a8a`,
                    }),
                  ],
                }),
                (0, $.jsxs)(a, {
                  sx: { display: `grid`, gridTemplateColumns: `1fr 1fr`, gap: 2 },
                  children: [
                    (0, $.jsx)(D, {
                      size: `small`,
                      label: `Logo (initiales)`,
                      value: pbLogo,
                      onChange: (e2) => setPbLogo(e2.target.value),
                      helperText: `Vide = initiales de la raison sociale`,
                      sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                    }),
                    (0, $.jsx)(D, {
                      size: `small`,
                      label: `Titre du document`,
                      value: pbTitre,
                      onChange: (e2) => setPbTitre(e2.target.value),
                      helperText: `Défaut : Bulletin de paie`,
                      sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                    }),
                  ],
                }),
                (0, $.jsxs)(a, {
                  sx: { display: `grid`, gridTemplateColumns: `1fr 1fr`, gap: 2 },
                  children: [
                    (0, $.jsxs)(D, {
                      select: !0,
                      size: `small`,
                      label: `Cotisations patronales (III)`,
                      value: pbPatronal,
                      onChange: (e2) => setPbPatronal(e2.target.value),
                      sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                      children: [
                        (0, $.jsx)(s, { value: `1`, children: `Afficher` }),
                        (0, $.jsx)(s, { value: `0`, children: `Masquer` }),
                      ],
                    }),
                    (0, $.jsxs)(D, {
                      select: !0,
                      size: `small`,
                      label: `Cumuls exercice & congés`,
                      value: pbCumuls,
                      onChange: (e2) => setPbCumuls(e2.target.value),
                      sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                      children: [
                        (0, $.jsx)(s, { value: `1`, children: `Afficher` }),
                        (0, $.jsx)(s, { value: `0`, children: `Masquer` }),
                      ],
                    }),
                    (0, $.jsxs)(D, {
                      select: !0,
                      size: `small`,
                      label: `Mentions légales`,
                      value: pbMentions,
                      onChange: (e2) => setPbMentions(e2.target.value),
                      sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                      children: [
                        (0, $.jsx)(s, { value: `1`, children: `Afficher` }),
                        (0, $.jsx)(s, { value: `0`, children: `Masquer` }),
                      ],
                    }),
                    (0, $.jsxs)(D, {
                      select: !0,
                      size: `small`,
                      label: `Signature employeur`,
                      value: pbSignature,
                      onChange: (e2) => setPbSignature(e2.target.value),
                      sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                      children: [
                        (0, $.jsx)(s, { value: `1`, children: `Afficher` }),
                        (0, $.jsx)(s, { value: `0`, children: `Masquer` }),
                      ],
                    }),
                  ],
                }),
                (0, $.jsx)(D, {
                  size: `small`,
                  multiline: !0,
                  minRows: 2,
                  label: `Mention personnalisée (optionnelle)`,
                  value: pbMention,
                  onChange: (e2) => setPbMention(e2.target.value),
                  helperText: `Ajoutée aux mentions du bulletin (ex. « Ne pas mettre en offset »).`,
                  sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                }),
                (0, $.jsx)(i, {
                  variant: `caption`,
                  sx: { color: `text.secondary` },
                  children:
                    `Les préférences s'appliquent à tous les bulletins (dialog + impression PDF) et sont enregistrées de façon persistante.`,
                }),
              ],
            }),
            (0, $.jsxs)(m, {
              sx: { px: 3, pb: 2 },
              children: [
                (0, $.jsx)(l, { onClick: fResetBul, children: `Réinitialiser` }),
                (0, $.jsx)(l, { onClick: () => setDlgBul(!1), children: `Annuler` }),
                (0, $.jsx)(l, {
                  variant: `contained`,
                  onClick: fSaveBul,
                  sx: { bgcolor: `#7e3ff2`, textTransform: `none` },
                  children: `Appliquer au bulletin`,
                }),
              ],
            }),
          ],
        }),
      }),
      (0, $.jsx)(f, {
        open: dlgTpl,
        onClose: () => setDlgTpl(!1),
        maxWidth: `lg`,
        fullWidth: !0,
        scroll: `paper`,
        PaperProps: { sx: { minHeight: `88vh` } },
        children: (0, $.jsxs)(a, {
          children: [
            (0, $.jsx)(h, {
              sx: { fontWeight: 800, display: `flex`, alignItems: `center`, gap: 1, flexWrap: `wrap`, pb: 0 },
              children: [
                (0, $.jsx)(x, { sx: { color: `#7e3ff2` } }),
                `Créer / modifier un modèle de bulletin`,
                (0, $.jsx)(a, { sx: { flex: 1 } }),
                (0, $.jsxs)(D, {
                  select: !0,
                  size: `small`,
                  label: `Modèle en cours d'édition`,
                  value: tplSelId,
                  onChange: (e2) => fTplOpen(e2.target.value),
                  sx: { minWidth: 250, "& .MuiInput-root": { fontSize: `0.8rem` } },
                  children: [
                    (0, $.jsx)(s, { value: ``, children: `＋ Nouveau modèle (à partir de zéro)` }),
                    (mt.modeles || []).map((t2) =>
                      (0, $.jsx)(s, { value: t2.id, children: t2.nom }, t2.id),
                    ),
                  ],
                }),
                (0, $.jsx)(l, {
                  size: `small`,
                  disabled: !tplSelId,
                  onClick: () => fTplDup(tplSelId),
                  sx: { textTransform: `none`, fontSize: `0.72rem` },
                  children: `Dupliquer`,
                }),
                (0, $.jsx)(l, {
                  size: `small`,
                  disabled: !tplSelId,
                  color: `error`,
                  onClick: () => fTplDel(tplSelId),
                  sx: { textTransform: `none`, fontSize: `0.72rem` },
                  children: `Supprimer`,
                }),
              ],
            }),
            (0, $.jsx)(p, {
              sx: { pt: 1 },
              children: (0, $.jsxs)(a, {
                sx: {
                  display: `grid`,
                  gridTemplateColumns: { md: `minmax(0,1fr) 400px`, xs: `1fr` },
                  gap: 2.5,
                  alignItems: `start`,
                },
                children: [
                  (0, $.jsxs)(o, {
                    spacing: 2.5,
                    sx: { minWidth: 0 },
                    children: [
                      (0, $.jsxs)(a, {
                        sx: { display: `flex`, gap: 1, flexWrap: `wrap` },
                        children: [
                          (0, $.jsx)(i, {
                            variant: `overline`,
                            sx: { color: `#7e3ff2`, fontWeight: 800, letterSpacing: 1 },
                            children: `Point de départ`,
                          }),
                          (0, $.jsx)(l, {
                            size: `small`,
                            variant: `outlined`,
                            onClick: () => fTplExemple(`zero`),
                            sx: { textTransform: `none`, fontSize: `0.7rem` },
                            children: `Partir de zéro`,
                          }),
                          (0, $.jsx)(l, {
                            size: `small`,
                            variant: `outlined`,
                            onClick: () => fTplExemple(`cm`),
                            title: `Pré-remplit CNPS 4,2 %, IRPP, retenue absences base/26, parts patronales`,
                            sx: { textTransform: `none`, fontSize: `0.7rem` },
                            children: `Exemple Cameroun`,
                          }),
                          (0, $.jsx)(l, {
                            size: `small`,
                            variant: `outlined`,
                            onClick: () => fTplExemple(`fr`),
                            title: `Pré-remplit un schéma de cotisations françaises simplifié`,
                            sx: { textTransform: `none`, fontSize: `0.7rem` },
                            children: `Exemple France (simplifié)`,
                          }),
                        ],
                      }),
                      (0, $.jsx)(D, {
                        size: `small`,
                        label: `Nom du modèle (interne)`,
                        value: tplEd ? tplEd.nom : ``,
                        onChange: (e2) => fTplSet(`nom`, e2.target.value),
                        helperText: `Ex. « Modèle Sénégal », « Grille usine » — apparaît dans le sélecteur de modèles.`,
                      }),
                      (0, $.jsx)(i, {
                        variant: `overline`,
                        sx: { color: `#7e3ff2`, fontWeight: 800, letterSpacing: 1 },
                        children: `1 · Entreprise (logo, coordonnées, identifiants)`,
                      }),
                      (0, $.jsxs)(a, {
                        sx: { display: `grid`, gridTemplateColumns: `1fr 1fr 1fr`, gap: 2 },
                        children: [
                          (0, $.jsx)(D, {
                            size: `small`,
                            label: `Raison sociale`,
                            value: tplEd && tplEd.entreprise ? tplEd.entreprise.raison : ``,
                            onChange: (e2) => fTplSet(`entreprise.raison`, e2.target.value),
                          }),
                          (0, $.jsx)(D, {
                            size: `small`,
                            label: `Adresse du siège`,
                            value: tplEd && tplEd.entreprise ? tplEd.entreprise.adresse : ``,
                            onChange: (e2) => fTplSet(`entreprise.adresse`, e2.target.value),
                          }),
                          (0, $.jsx)(D, {
                            size: `small`,
                            label: `Pays (mentions légales)`,
                            value: tplEd && tplEd.entreprise ? tplEd.entreprise.pays : ``,
                            onChange: (e2) => fTplSet(`entreprise.pays`, e2.target.value),
                            helperText: `Ex. Cameroun, France…`,
                          }),
                        ],
                      }),
                      (0, $.jsxs)(a, {
                        sx: { display: `flex`, gap: 1.5, alignItems: `center`, flexWrap: `wrap` },
                        children: [
                          (0, $.jsx)(`input`, {
                            id: `pa-tpl-logo-input`,
                            type: `file`,
                            accept: `image/*`,
                            style: { display: `none` },
                            onChange: (e2) => {
                              var f2 = e2.target.files && e2.target.files[0];
                              if (f2)
                                paLogoResize(f2, function (d2) {
                                  if (d2) fTplSet(`entreprise.logoData`, d2);
                                });
                              e2.target.value = ``;
                            },
                          }),
                          (0, $.jsx)(l, {
                            size: `small`,
                            variant: `outlined`,
                            component: `label`,
                            htmlFor: `pa-tpl-logo-input`,
                            sx: { textTransform: `none`, fontSize: `0.72rem` },
                            children: `Téléverser un logo`,
                          }),
                          tplEd && tplEd.entreprise && tplEd.entreprise.logoData
                            ? (0, $.jsx)(a, {
                                component: `img`,
                                src: tplEd.entreprise.logoData,
                                sx: { height: 34, maxWidth: 110, objectFit: `contain`, bgcolor: `#fff`, border: `1px solid #e5e7eb`, borderRadius: 1, p: 0.5 },
                              })
                            : null,
                          tplEd && tplEd.entreprise && tplEd.entreprise.logoData
                            ? (0, $.jsx)(l, {
                                size: `small`,
                                onClick: () => fTplSet(`entreprise.logoData`, ``),
                                sx: { textTransform: `none`, fontSize: `0.7rem` },
                                children: `Retirer le logo`,
                              })
                            : (0, $.jsx)(D, {
                                size: `small`,
                                label: `Logo par initiales (sans image)`,
                                value: tplEd && tplEd.entreprise ? tplEd.entreprise.logoInitiales : ``,
                                onChange: (e2) => fTplSet(`entreprise.logoInitiales`, e2.target.value),
                                sx: { width: 220 },
                                helperText: `Ex. AR — max 4 caractères`,
                              }),
                        ],
                      }),
                      (0, $.jsx)(`div`, {
                        children: (tplEd && tplEd.entreprise ? tplEd.entreprise.ids || [] : []).map(
                          (id2, i2) =>
                            (0, $.jsxs)(
                              a,
                              {
                                sx: { display: `flex`, gap: 1, alignItems: `center`, mb: 1 },
                                children: [
                                  (0, $.jsx)(D, {
                                    size: `small`,
                                    label: `Identifiant ` + (i2 + 1) + ` — libellé`,
                                    value: id2.label || ``,
                                    onChange: (e2) => {
                                      var arr = JSON.parse(JSON.stringify(tplEd.entreprise.ids || []));
                                      arr[i2] = Object.assign({}, arr[i2], { label: e2.target.value });
                                      fTplSet(`entreprise.ids`, arr);
                                    },
                                    sx: { width: 220 },
                                  }),
                                  (0, $.jsx)(D, {
                                    size: `small`,
                                    label: `Valeur`,
                                    value: id2.valeur || ``,
                                    onChange: (e2) => {
                                      var arr = JSON.parse(JSON.stringify(tplEd.entreprise.ids || []));
                                      arr[i2] = Object.assign({}, arr[i2], { valeur: e2.target.value });
                                      fTplSet(`entreprise.ids`, arr);
                                    },
                                    sx: { flex: 1 },
                                  }),
                                  (0, $.jsx)(l, {
                                    size: `small`,
                                    onClick: () => {
                                      var arr = JSON.parse(JSON.stringify(tplEd.entreprise.ids || []));
                                      arr.splice(i2, 1);
                                      fTplSet(`entreprise.ids`, arr);
                                    },
                                    title: `Retirer cet identifiant`,
                                    sx: { minWidth: 0, px: 1 },
                                    children: `×`,
                                  }),
                                ],
                              },
                              `id-` + i2,
                            ),
                        ),
                      }),
                      (0, $.jsx)(l, {
                        size: `small`,
                        startIcon: (0, $.jsx)(x, { sx: { fontSize: 15 } }),
                        disabled: !tplEd || !tplEd.entreprise || (tplEd.entreprise.ids || []).length >= 4,
                        onClick: () => {
                          var arr = JSON.parse(JSON.stringify(tplEd.entreprise.ids || []));
                          arr.push({ label: ``, valeur: `` });
                          fTplSet(`entreprise.ids`, arr);
                        },
                        sx: { textTransform: `none`, fontSize: `0.72rem` },
                        children: `Ajouter un identifiant entreprise (RCCM, N° TVA, Registre CNPS, SIREN…)`,
                      }),
                      (0, $.jsx)(i, {
                        variant: `overline`,
                        sx: { color: `#7e3ff2`, fontWeight: 800, letterSpacing: 1 },
                        children: `2 · Devise et montants`,
                      }),
                      (0, $.jsxs)(a, {
                        sx: { display: `grid`, gridTemplateColumns: `1fr 1fr 1fr`, gap: 2 },
                        children: [
                          (0, $.jsx)(D, {
                            size: `small`,
                            label: `Code devise`,
                            value: tplEd ? tplEd.devise : ``,
                            onChange: (e2) => fTplSet(`devise`, e2.target.value.toUpperCase().slice(0, 6)),
                            helperText: `FCFA, EUR, USD, GBP, MAD…`,
                          }),
                          (0, $.jsx)(D, {
                            size: `small`,
                            label: `Devise en toutes lettres`,
                            value: tplEd ? tplEd.deviseLettres : ``,
                            onChange: (e2) => fTplSet(`deviseLettres`, e2.target.value),
                            helperText: `Pour « arrêté la somme de… »`,
                          }),
                          (0, $.jsxs)(D, {
                            select: !0,
                            size: `small`,
                            label: `Décimales des montants`,
                            value: tplEd && tplEd.decimales === 2 ? `2` : `0`,
                            onChange: (e2) => fTplSet(`decimales`, e2.target.value === `2` ? 2 : 0),
                            children: [
                              (0, $.jsx)(s, { value: `0`, children: `Entiers (FCFA, XOF…)` }),
                              (0, $.jsx)(s, { value: `2`, children: `2 décimales (EUR, USD…)` }),
                            ],
                          }),
                        ],
                      }),
                      (0, $.jsxs)(a, {
                        sx: { display: `flex`, gap: 0.75, flexWrap: `wrap` },
                        children: [
                          [`FCFA`, `XOF`, `EUR`, `USD`, `GBP`, `MAD`, `CHF`, `CAD`].map((dv) =>
                            (0, $.jsx)(
                              l,
                              {
                                size: `small`,
                                variant: tplEd && tplEd.devise === dv ? `contained` : `outlined`,
                                onClick: () => fTplSet(`devise`, dv),
                                sx: { textTransform: `none`, fontSize: `0.65rem`, minWidth: 0, px: 0.8, py: 0.1 },
                                children: dv,
                              },
                              dv,
                            ),
                          ),
                        ],
                      }),
                      (0, $.jsx)(i, {
                        variant: `overline`,
                        sx: { color: `#7e3ff2`, fontWeight: 800, letterSpacing: 1 },
                        children: `3 · Rubriques et formules de calcul (fiscalité de votre pays)`,
                      }),
                      (0, $.jsx)(i, {
                        variant: `caption`,
                        sx: { color: `text.secondary`, display: `block` },
                        children:
                          `Chaque rubrique est calculée pour N'IMPORTE QUEL employé. Variables : base (salaire de base), brut (gains cumulés à cette ligne), hs (montant heures supp.), hsHeures, joursAbsents, ancienneteMois, ancienneteAnnees, nbEnfants, tauxHoraire, mois, an. Référence à une rubrique précédente : [CODE]. Fonctions : MIN(a,b), MAX(a,b), ROUND(x,n), ABS(x). Décimales avec point (4.2), séparateur de fonctions : virgule.`,
                      }),
                      (tplEd ? tplEd.rubriques : []).map((r2, i2) =>
                        (0, $.jsxs)(
                          a,
                          {
                            sx: { border: `1px solid #e5e7eb`, borderRadius: 1.5, p: 1.25 },
                            children: [
                              (0, $.jsxs)(a, {
                                sx: { display: `grid`, gridTemplateColumns: `70px 1fr 150px auto`, gap: 1, alignItems: `center` },
                                children: [
                                  (0, $.jsx)(D, {
                                    size: `small`,
                                    label: `Code`,
                                    value: r2.code || ``,
                                    onChange: (e2) => fTplRubSet(i2, `code`, e2.target.value),
                                  }),
                                  (0, $.jsx)(D, {
                                    size: `small`,
                                    label: `Libellé (affiché)`,
                                    value: r2.libelle || ``,
                                    onChange: (e2) => fTplRubSet(i2, `libelle`, e2.target.value),
                                  }),
                                  (0, $.jsxs)(D, {
                                    select: !0,
                                    size: `small`,
                                    label: `Type`,
                                    value: r2.type || `gain`,
                                    onChange: (e2) => fTplRubSet(i2, `type`, e2.target.value),
                                    children: [
                                      (0, $.jsx)(s, { value: `gain`, children: `Gain` }),
                                      (0, $.jsx)(s, { value: `retenue`, children: `Retenue` }),
                                      (0, $.jsx)(s, { value: `patronal`, children: `Part patronale` }),
                                    ],
                                  }),
                                  (0, $.jsxs)(a, {
                                    sx: { display: `flex`, gap: 0.25 },
                                    children: [
                                      (0, $.jsx)(l, {
                                        size: `small`,
                                        disabled: i2 === 0,
                                        onClick: () => fTplRubMove(i2, -1),
                                        title: `Monter`,
                                        sx: { minWidth: 0, px: 0.6 },
                                        children: (0, $.jsx)(AU, { sx: { fontSize: 16 } }),
                                      }),
                                      (0, $.jsx)(l, {
                                        size: `small`,
                                        disabled: i2 >= (tplEd.rubriques.length || 0) - 1,
                                        onClick: () => fTplRubMove(i2, 1),
                                        title: `Descendre`,
                                        sx: { minWidth: 0, px: 0.6 },
                                        children: (0, $.jsx)(AD, { sx: { fontSize: 16 } }),
                                      }),
                                      (0, $.jsx)(l, {
                                        size: `small`,
                                        color: `error`,
                                        onClick: () => fTplRubDel(i2),
                                        title: `Supprimer la rubrique`,
                                        sx: { minWidth: 0, px: 0.6 },
                                        children: `×`,
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              (0, $.jsxs)(a, {
                                sx: { display: `grid`, gridTemplateColumns: `1fr 130px 130px`, gap: 1, mt: 1 },
                                children: [
                                  (0, $.jsx)(D, {
                                    size: `small`,
                                    label: `Formule de calcul`,
                                    value: r2.formule || ``,
                                    onChange: (e2) => fTplRubSet(i2, `formule`, e2.target.value),
                                    error: !(r2.formule || ``).trim() || isNaN(paTplEval(r2.formule, { base: 0, brut: 0, hs: 0, hsHeures: 0, joursAbsents: 0, ancienneteMois: 0, ancienneteAnnees: 0, nbEnfants: 0, tauxHoraire: 0, mois: 1, an: 2026 }, {})),
                                    sx: { "& .MuiInput-root": { fontSize: `0.8rem`, fontFamily: `monospace` } },
                                  }),
                                  (0, $.jsx)(D, {
                                    size: `small`,
                                    label: `Colonne Base`,
                                    value: r2.baseLbl || ``,
                                    onChange: (e2) => fTplRubSet(i2, `baseLbl`, e2.target.value),
                                  }),
                                  (0, $.jsx)(D, {
                                    size: `small`,
                                    label: `Colonne Taux`,
                                    value: r2.tauxLbl || ``,
                                    onChange: (e2) => fTplRubSet(i2, `tauxLbl`, e2.target.value),
                                  }),
                                ],
                              }),
                            ],
                          },
                          `rub-` + i2,
                        ),
                      ),
                      (0, $.jsxs)(a, {
                        sx: { display: `flex`, gap: 1, flexWrap: `wrap` },
                        children: [
                          (0, $.jsx)(l, {
                            size: `small`,
                            variant: `outlined`,
                            startIcon: (0, $.jsx)(x, { sx: { fontSize: 15 } }),
                            onClick: () => fTplRubAdd(`gain`),
                            sx: { textTransform: `none`, fontSize: `0.72rem`, color: `#065f46`, borderColor: `#065f46` },
                            children: `Ajouter un gain`,
                          }),
                          (0, $.jsx)(l, {
                            size: `small`,
                            variant: `outlined`,
                            startIcon: (0, $.jsx)(x, { sx: { fontSize: 15 } }),
                            onClick: () => fTplRubAdd(`retenue`),
                            sx: { textTransform: `none`, fontSize: `0.72rem`, color: `#991b1b`, borderColor: `#991b1b` },
                            children: `Ajouter une retenue`,
                          }),
                          (0, $.jsx)(l, {
                            size: `small`,
                            variant: `outlined`,
                            startIcon: (0, $.jsx)(x, { sx: { fontSize: 15 } }),
                            onClick: () => fTplRubAdd(`patronal`),
                            sx: { textTransform: `none`, fontSize: `0.72rem`, color: `#1e40af`, borderColor: `#1e40af` },
                            children: `Ajouter une part patronale`,
                          }),
                        ],
                      }),
                      (0, $.jsx)(i, {
                        variant: `overline`,
                        sx: { color: `#7e3ff2`, fontWeight: 800, letterSpacing: 1 },
                        children: `4 · Apparence du bulletin`,
                      }),
                      (0, $.jsxs)(a, {
                        sx: { display: `grid`, gridTemplateColumns: `1fr 1fr`, gap: 2 },
                        children: [
                          (0, $.jsxs)(D, {
                            select: !0,
                            size: `small`,
                            label: `Gabarit de mise en page`,
                            value: tplEd && PA_MODELES[tplEd.apparence.layout] ? tplEd.apparence.layout : `moderne`,
                            onChange: (e2) => fTplSet(`apparence.layout`, e2.target.value),
                            children: Object.keys(PA_MODELES).map((mk) =>
                              (0, $.jsx)(s, { value: mk, children: PA_MODELES[mk].nom + ` — ` + PA_MODELES[mk].desc }, mk),
                            ),
                          }),
                          (0, $.jsx)(D, {
                            size: `small`,
                            label: `Titre du document`,
                            value: tplEd ? tplEd.apparence.titre : ``,
                            onChange: (e2) => fTplSet(`apparence.titre`, e2.target.value),
                            helperText: `Ex. Bulletin de paie, Pay Slip, Feuille de salaire`,
                          }),
                        ],
                      }),
                      (0, $.jsxs)(a, {
                        sx: { display: `flex`, gap: 1, alignItems: `center`, flexWrap: `wrap` },
                        children: [
                          (0, $.jsx)(i, { variant: `caption`, sx: { fontWeight: 700 }, children: `Couleur d'accent :` }),
                          [`#1e3a8a`, `#7e3ff2`, `#0f766e`, `#b45309`, `#be123c`, `#334155`, `#065f46`, `#4338ca`].map((c2) =>
                            (0, $.jsx)(
                              a,
                              {
                                onClick: () => fTplSet(`apparence.accent`, c2),
                                title: c2,
                                sx: {
                                  width: 24,
                                  height: 24,
                                  borderRadius: `50%`,
                                  bgcolor: c2,
                                  cursor: `pointer`,
                                  border: tplEd && tplEd.apparence.accent === c2 ? `3px solid #111827` : `2px solid #fff`,
                                  boxShadow: `0 0 0 1px #cbd5e1`,
                                },
                              },
                              c2,
                            ),
                          ),
                          (0, $.jsx)(D, {
                            size: `small`,
                            value: tplEd ? tplEd.apparence.accent : ``,
                            onChange: (e2) => fTplSet(`apparence.accent`, e2.target.value),
                            sx: { width: 130, "& .MuiInput-root": { fontSize: `0.8rem` } },
                            placeholder: `#1e3a8a`,
                          }),
                        ],
                      }),
                      (0, $.jsxs)(a, {
                        sx: { display: `grid`, gridTemplateColumns: `1fr 1fr`, gap: 2 },
                        children: [
                          (0, $.jsxs)(D, {
                            select: !0,
                            size: `small`,
                            label: `Sections patronales (III)`,
                            value: tplEd && tplEd.apparence.patronal !== 0 ? `1` : `0`,
                            onChange: (e2) => fTplSet(`apparence.patronal`, e2.target.value === `1` ? 1 : 0),
                            children: [
                              (0, $.jsx)(s, { value: `1`, children: `Afficher` }),
                              (0, $.jsx)(s, { value: `0`, children: `Masquer` }),
                            ],
                          }),
                          (0, $.jsxs)(D, {
                            select: !0,
                            size: `small`,
                            label: `Cumuls exercice & congés`,
                            value: tplEd && tplEd.apparence.cumuls !== 0 ? `1` : `0`,
                            onChange: (e2) => fTplSet(`apparence.cumuls`, e2.target.value === `1` ? 1 : 0),
                            children: [
                              (0, $.jsx)(s, { value: `1`, children: `Afficher` }),
                              (0, $.jsx)(s, { value: `0`, children: `Masquer` }),
                            ],
                          }),
                          (0, $.jsxs)(D, {
                            select: !0,
                            size: `small`,
                            label: `Mentions légales`,
                            value: tplEd && tplEd.apparence.mentions !== 0 ? `1` : `0`,
                            onChange: (e2) => fTplSet(`apparence.mentions`, e2.target.value === `1` ? 1 : 0),
                            children: [
                              (0, $.jsx)(s, { value: `1`, children: `Afficher` }),
                              (0, $.jsx)(s, { value: `0`, children: `Masquer` }),
                            ],
                          }),
                          (0, $.jsxs)(D, {
                            select: !0,
                            size: `small`,
                            label: `Signature employeur`,
                            value: tplEd && tplEd.apparence.signature !== 0 ? `1` : `0`,
                            onChange: (e2) => fTplSet(`apparence.signature`, e2.target.value === `1` ? 1 : 0),
                            children: [
                              (0, $.jsx)(s, { value: `1`, children: `Afficher` }),
                              (0, $.jsx)(s, { value: `0`, children: `Masquer` }),
                            ],
                          }),
                        ],
                      }),
                      (0, $.jsx)(D, {
                        size: `small`,
                        multiline: !0,
                        minRows: 2,
                        label: `Mention personnalisée (optionnelle)`,
                        value: tplEd ? tplEd.apparence.mention : ``,
                        onChange: (e2) => fTplSet(`apparence.mention`, e2.target.value),
                        sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                      }),
                    ],
                  }),
                  (0, $.jsxs)(a, {
                    sx: {
                      position: `sticky`,
                      top: 8,
                      bgcolor: `#eef1f5`,
                      borderRadius: 1.5,
                      p: 1.25,
                      minWidth: 0,
                    },
                    children: [
                      (0, $.jsx)(i, {
                        variant: `overline`,
                        sx: { color: `#7e3ff2`, fontWeight: 800, letterSpacing: 1 },
                        children: `Aperçu en direct`,
                      }),
                      (0, $.jsxs)(D, {
                        select: !0,
                        size: `small`,
                        label: `Employé de l'aperçu`,
                        value: tplEmpId && tplEmpIds.indexOf(tplEmpId) >= 0 ? tplEmpId : tplEmpIds[0] || ``,
                        onChange: (e2) => setTplEmpId(e2.target.value),
                        sx: { mb: 1.25, bgcolor: `#fff`, borderRadius: 1, "& .MuiInput-root": { fontSize: `0.8rem` } },
                        children: tplEmpIds.map((eid) => {
                          var e3 = R(eid);
                          return (0, $.jsx)(s, { value: eid, children: e3 ? B(e3) : eid }, eid);
                        }),
                      }),
                      tplErrs.length
                        ? (0, $.jsx)(c, {
                            severity: `warning`,
                            sx: { mb: 1.25, fontSize: `0.72rem` },
                            children: (0, $.jsxs)(`ul`, {
                              style: { margin: 0, paddingLeft: 16 },
                              children: tplErrs.map((er, i2) => (0, $.jsx)(`li`, { children: er }, `er-` + i2)),
                            }),
                          })
                        : (0, $.jsx)(i, {
                            variant: `caption`,
                            sx: { display: `block`, mb: 1.25, color: `#065f46`, fontWeight: 700 },
                            children: `✓ Modèle valide — appliqué à tout employé`,
                          }),
                      pvO
                        ? (0, $.jsx)(`style`, {
                            dangerouslySetInnerHTML: { __html: paBulCSS(`dialog`, pvO) },
                          })
                        : null,
                      (0, $.jsx)(a, {
                        className: `paBulBox`,
                        sx: { maxHeight: `58vh`, overflow: `auto`, borderRadius: 1 },
                        dangerouslySetInnerHTML: {
                          __html: pvBT
                            ? paTplBody(pvBT, pvRw, pvO, tplEd)
                            : `<div style="padding:30px;text-align:center;color:#6b7280">Aucun employé disponible pour l'aperçu.</div>`,
                        },
                      }),
                      pvBT
                        ? (0, $.jsx)(i, {
                            variant: `caption`,
                            sx: { display: `block`, mt: 1, color: `text.secondary` },
                            children:
                              `Aperçu calculé depuis les sources réelles du mois courant — net : ` +
                              paDeviseFmt(pvBT.net, { decimales: pvBT.decimales }) +
                              ` ` +
                              pvBT.devise,
                          })
                        : null,
                    ],
                  }),
                ],
              }),
            }),
            (0, $.jsxs)(m, {
              sx: { px: 3, pb: 2 },
              children: [
                (0, $.jsx)(l, { onClick: () => setDlgTpl(!1), children: `Annuler` }),
                (0, $.jsx)(l, {
                  variant: `contained`,
                  onClick: fTplSave,
                  disabled: !!(tplErrs && tplErrs.length),
                  title: tplErrs && tplErrs.length ? `Corrigez les erreurs avant d'enregistrer` : ``,
                  sx: { bgcolor: `#7e3ff2`, textTransform: `none` },
                  children: `Enregistrer et appliquer`,
                }),
              ],
            }),
          ],
        }),
      }),
      (0, $.jsx)(d, {
        open: snack != null,
        autoHideDuration: 3800,
        onClose: () => setSnack(null),
        anchorOrigin: { vertical: `bottom`, horizontal: `center` },
        message: snack ? snack.msg : ``,
      }),
    ],
  });
}
/* — BULLETIN DE PAIE V4 (modèle standard international fourni) : helpers,
   décomposition légale (CNPS 4,2 % + IRPP), charges patronales,
   cumuls exercice, congés, montant en lettres, CSS scoping, papier A4. — */
var PA_MOIS_L = [
  `Janvier`, `Février`, `Mars`, `Avril`, `Mai`, `Juin`,
  `Juillet`, `Août`, `Septembre`, `Octobre`, `Novembre`, `Décembre`,
];
function paMoisLong(k) {
  return k && k.mois >= 1 && k.mois <= 12
    ? PA_MOIS_L[k.mois - 1] + ` ` + k.an
    : `—`;
}
function paAnciennete(emp, an) {
  var em = emp && emp.date_embauche ? new Date(emp.date_embauche) : null;
  if (!em || isNaN(em.getTime())) return ``;
  var ref = new Date(Date.UTC(Number(an) || em.getFullYear(), 11, 31));
  var tot =
    (ref.getUTCFullYear() - em.getFullYear()) * 12 +
    (ref.getUTCMonth() - em.getMonth());
  if (tot < 0) return ``;
  var a2 = Math.floor(tot / 12), m2 = tot % 12, out = [];
  if (a2) out.push(a2 + (a2 > 1 ? ` ans` : ` an`));
  if (m2) out.push(m2 + ` mois`);
  return out.join(` `);
}
function pa99(x) {
  var U = [``, `un`, `deux`, `trois`, `quatre`, `cinq`, `six`, `sept`,
    `huit`, `neuf`, `dix`, `onze`, `douze`, `treize`, `quatorze`,
    `quinze`, `seize`, `dix-sept`, `dix-huit`, `dix-neuf`];
  var D = [``, ``, `vingt`, `trente`, `quarante`, `cinquante`, `soixante`];
  function d99(y) {
    if (y < 20) return U[y];
    var d = Math.floor(y / 10), u = y % 10;
    if (d === 8) return u === 0 ? `quatre-vingts` : `quatre-vingt-` + d99(u);
    if (d === 7) return u === 0 ? `soixante-dix` : `soixante-` + d99(10 + u);
    if (d === 9) return u === 0 ? `quatre-vingt-dix` : `quatre-vingt-` + d99(10 + u);
    if (u === 0) return D[d];
    if (u === 1) return D[d] + `-et-un`;
    return D[d] + `-` + U[u];
  }
  var c = Math.floor(x / 100), r = x % 100, s = ``;
  if (c === 1) s = `cent`;
  else if (c > 1) s = U[c] + ` cent` + (r === 0 ? `s` : ``);
  if (r) s = s ? s + ` ` + d99(r) : d99(r);
  return s || `zéro`;
}
function paEnLettres(n) {
  n = Math.round(Math.abs(Number(n) || 0));
  if (!n) return `zéro`;
  var m = Math.floor(n / 1e6), k = Math.floor((n % 1e6) / 1e3), u = n % 1e3, out = [];
  if (m) out.push(m === 1 ? `un million` : pa99(m) + ` millions`);
  if (k) out.push(k === 1 ? `mille` : pa99(k) + ` mille`);
  if (u) out.push(pa99(u));
  return out.join(` `) || `zéro`;
}
function paHSHeuresMois(eid, an, mois) {
  var tot = 0;
  hsToutes().forEach(function (h) {
    if (h.employee_id !== eid) return;
    if (h.statut === `rejetee` || h.statut === `en_attente`) return;
    var si = hsSemInfo(h.semaine);
    if (si && String(si.an) === String(an) && hsSemMois(si.num, si.an) === mois)
      tot += Number(h.heures_supp) || 0;
  });
  return Math.round(tot);
}
function paPatronal(brut) {
  var L = [
    { label: `Prestations familiales (CNPS)`, taux: 7 },
    { label: `Pension de vieillesse — part patronale (CNPS)`, taux: 4.2 },
    { label: `Accidents du travail & maladies prof.`, taux: 2.5 },
    { label: `FNE — Fonds National de l'Emploi`, taux: 1 },
  ];
  L.forEach(function (l2) {
    l2.montant = Math.round(((brut || 0) * l2.taux) / 100);
  });
  return L;
}
function paCongesInfo(eid, an, emp) {
  var pris = 0;
  try {
    var FER = sldFset();
    sldDemandes().forEach(function (q2) {
      if (q2.employee_id !== eid) return;
      if (q2.type_conge !== `conge_annuel` || q2.statut !== `approuvee`) return;
      if (String(q2.date_debut || ``).slice(0, 4) !== String(an)) return;
      pris += sldOuvrables(q2.date_debut, q2.date_fin, FER);
    });
  } catch (err) {}
  var dr = emp ? sldDroit(emp, Number(an) || new Date().getFullYear()) : { droit: 0 };
  return {
    droit: dr.droit || 0,
    pris: pris,
    solde: Math.max(0, (dr.droit || 0) - pris),
  };
}
function paCumuls(rw) {
  var k = paDeKey(rw.mois) || { an: 0, mois: 0 };
  var cB = 0, cN = 0;
  paToutes().forEach(function (r2) {
    if (r2.employee_id !== rw.employee_id) return;
    if (r2.statut === `rejetee`) return;
    var k2 = paDeKey(r2.mois);
    if (!k2 || String(k2.an) !== String(k.an) || k2.mois > k.mois) return;
    cB += r2.salaire_brut || 0;
    cN += r2.net_a_payer || 0;
  });
  return { brut: Math.round(cB), net: Math.round(cN), charges: Math.round(cB - cN) };
}
function paBulData(rw, mt) {
  var emp = rw.emp || R(rw.employee_id) || {};
  var k = paDeKey(rw.mois) || { an: 0, mois: 0 };
  var base = rw.salaire_base || 0;
  var hsM = rw.hs_montant || 0;
  var abs = rw.retenue_absences || 0;
  var cotis = rw.cotisations || 0;
  var cnps = Math.round(((rw.salaire_brut || 0) * 4.2) / 100);
  var irpp = Math.max(0, cotis - cnps);
  var pret = rw.pret_retenue || 0;
  var gains = base + hsM;
  var net = rw.net_a_payer != null ? rw.net_a_payer : gains - abs - cotis - pret;
  var retSum = abs + cotis + pret;
  var ecart = gains - net - retSum;
  var hsH = paHSHeuresMois(rw.employee_id, k.an, k.mois);
  var lignes = [
    { label: `Salaire de base`, g: base, r: null },
    {
      label:
        `Heures supplémentaires` +
        (hsH > 0
          ? ` (` + hsH + ` h — majorations décret n° 93/184)`
          : ` (aucune)`),
      g: hsM || null,
      r: null,
    },
    { label: `TOTAL BRUT (salaire + HS)`, g: gains, r: null, bold: 1 },
    {
      label: `Absences non travaillées (` + (rw.jours_absents || 0) + ` j — art. 86 CT)`,
      g: null,
      r: abs || null,
    },
    { label: `Cotisation CNPS — pension vieillesse (part salariale 4,2 %)`, g: null, r: cnps || null },
    {
      label: `Impôt sur le revenu (IRPP) & contributions — taux global ` + (rw.taux_charges || 0) + ` %`,
      g: null,
      r: irpp || null,
    },
    { label: `Remboursement prêt / avance (mensualité en cours)`, g: null, r: pret || null },
  ];
  if (Math.abs(ecart) >= 1)
    lignes.push({ label: `Ajustement (plafonnement du brut)`, g: null, r: ecart });
  lignes.push({ label: `TOTAL RETENUES`, g: null, r: gains - net, bold: 1 });
  lignes.push({ label: `NET À PAYER`, g: null, r: net, bold: 1, net: 1 });
  var patronal = paPatronal(rw.salaire_brut || 0);
  var patTot = patronal.reduce(function (s2, l2) { return s2 + l2.montant; }, 0);
  var num =
    `BL-` + k.an + `-` + (k.mois < 10 ? `0` : ``) + k.mois + `-` +
    (emp.matricule || rw.employee_id);
  return {
    emp: emp,
    k: k,
    periode: paMoisLong(k),
    num: num,
    lignes: lignes,
    gains: gains,
    net: net,
    cnps: cnps,
    irpp: irpp,
    patronal: patronal,
    patTot: patTot,
    cumuls: paCumuls(rw),
    conges: paCongesInfo(rw.employee_id, k.an, emp),
    anciennete: paAnciennete(emp, k.an),
    hsH: hsH,
    lettres: paEnLettres(net),
    raison: (mt && mt.empRaison) || `Admina-RH SARL`,
    rccm: (mt && mt.empRccm) || `—`,
    niu: (mt && mt.empNiu) || `—`,
    cnpsEmp: (mt && mt.empCnpsEmp) || `—`,
    adresse: (mt && mt.empAdresse) || `—`,
  };
}
function paBulEsc(s2) {
  return String(s2 == null ? `` : s2).replace(/&/g, `&amp;`).replace(/</g, `&lt;`).replace(/>/g, `&gt;`);
}
function paBulFmt(n) {
  try {
    return new Intl.NumberFormat(`fr-FR`).format(Math.round(Number(n) || 0));
  } catch (err) {
    return String(Math.round(Number(n) || 0));
  }
}
/* — Catalogue des modèles de bulletin (standards internationaux) — */
var PA_MODELES = {
  moderne: { nom: `Moderne`, desc: `Palette accentuée, sections colorées` },
  classique: { nom: `Classique`, desc: `Administratif serif, noir & blanc` },
  compact: { nom: `Compact`, desc: `Dense — économie de papier` },
  elegance: { nom: `Élégance`, desc: `Bandeau coloré, rendu contemporain` },
};
function paAccentHex(ac) {
  var m = /^#?([0-9a-fA-F]{6})$/.exec(String(ac || ``));
  if (!m) return null;
  var h = m[1];
  function ch(i) { return parseInt(h.slice(i, i + 2), 16); }
  function hx(v) {
    v = Math.max(0, Math.min(255, Math.round(v)));
    var s = v.toString(16);
    return s.length < 2 ? `0` + s : s;
  }
  var r = ch(0), g = ch(2), b = ch(4);
  return {
    main: `#` + hx(r) + hx(g) + hx(b),
    dark: `#` + hx(r * 0.8) + hx(g * 0.8) + hx(b * 0.82),
    soft: `#` + hx(r + (255 - r) * 0.93) + hx(g + (255 - g) * 0.93) + hx(b + (255 - b) * 0.93),
    brd: `#` + hx(r + (255 - r) * 0.7) + hx(g + (255 - g) * 0.7) + hx(b + (255 - b) * 0.7),
  };
}
function paBulOpts(mt) {
  mt = mt || {};
  var TPLK = String(mt.bulModele || ``);
  var TPL =
    TPLK.slice(0, 7) === `custom:`
      ? (mt.modeles || []).find(function (x2) { return x2.id === TPLK.slice(7); }) || null
      : null;
  var ap = TPL && TPL.apparence ? TPL.apparence : null;
  var ac = paAccentHex(ap ? ap.accent : mt.bulAccent) || paAccentHex(`#1e3a8a`);
  var modele = ap
    ? PA_MODELES[ap.layout]
      ? ap.layout
      : `moderne`
    : PA_MODELES[mt.bulModele]
      ? mt.bulModele
      : `moderne`;
  var logo2 = ap
    ? String((TPL.entreprise && TPL.entreprise.logoInitiales) || ``).trim().slice(0, 4)
    : String(mt.bulLogo || ``).trim().slice(0, 4);
  var titre2 = ap
    ? String(ap.titre || ``).trim().slice(0, 60) || `Bulletin de paie`
    : String(mt.bulTitre || ``).trim().slice(0, 60) || `Bulletin de paie`;
  return {
    modele: modele,
    accent: ac,
    logo: logo2,
    logoData: ap ? String((TPL.entreprise && TPL.entreprise.logoData) || ``) : ``,
    titre: titre2,
    patronal: ap ? ap.patronal !== 0 : mt.bulPatronal !== 0,
    cumuls: ap ? ap.cumuls !== 0 : mt.bulCumuls !== 0,
    mentions: ap ? ap.mentions !== 0 : mt.bulMentions !== 0,
    signature: ap ? ap.signature !== 0 : mt.bulSignature !== 0,
    mention: ap
      ? String(ap.mention || ``).trim().slice(0, 300)
      : String(mt.bulMention || ``).trim().slice(0, 300),
    tpl: TPL,
  };
}
/* CSS du bulletin — placeholders : « SLIP » = préfixe de scope (dialog :
   « .paBulBox » / print : « »), « BODY » = cible body (print) ou conteneur
   (dialog), AC1..AC4 = déclinaisons de la couleur d'accent personnalisable. */
function paBulCSS(mode, O) {
  O = O || paBulOpts(null);
  var sc = mode === `dialog` ? `.paBulBox ` : ``;
  var bb = mode === `dialog` ? `.paBulBox ` : `body`;
  var AC = O.accent || paAccentHex(`#1e3a8a`);
  var css = `SLIP *,SLIP *::before,SLIP *::after{box-sizing:border-box;}
BODY{margin:0;padding:24px 12px 48px;font-family:"Segoe UI",system-ui,-apple-system,"Helvetica Neue",Arial,sans-serif;font-size:11px;line-height:1.45;color:#111827;background:#eef1f5;-webkit-font-smoothing:antialiased;}
SLIP .toolbar{max-width:210mm;margin:0 auto 14px;display:flex;justify-content:flex-end;gap:8px;}
SLIP .btn{font:inherit;font-weight:600;padding:8px 16px;border:1px solid AC1;background:AC1;color:#fff;border-radius:6px;cursor:pointer;}
SLIP .btn:hover{background:AC2;}
SLIP .payslip{width:210mm;min-height:297mm;margin:0 auto;background:#ffffff;padding:12mm 12mm 14mm;box-shadow:0 4px 24px rgba(15,23,42,.14);border-radius:3px;position:relative;}
SLIP .header{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;padding-bottom:10px;border-bottom:2.5px solid AC1;}
SLIP .employer{display:flex;gap:12px;max-width:58%;}
SLIP .logo{width:52px;height:52px;flex:0 0 52px;border-radius:6px;background:AC1;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;letter-spacing:.5px;}
SLIP .logo img{width:100%;height:100%;object-fit:contain;display:block;}
SLIP .logo.hasimg{background:#fff;border:1px solid AC4;color:AC1;overflow:hidden;}
SLIP .employer h1{margin:0 0 3px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;color:AC1;}
SLIP .employer p{margin:0;font-size:10px;color:#6b7280;}
SLIP .employer .meta{margin-top:4px;font-size:9.5px;color:#6b7280;}
SLIP .doc-title{text-align:right;min-width:38%;}
SLIP .doc-title h2{margin:0;font-size:19px;letter-spacing:1.6px;text-transform:uppercase;color:AC1;font-weight:800;}
SLIP .doc-title .sub{display:inline-block;margin-top:4px;padding:3px 10px;background:AC3;border:1px solid AC4;border-radius:99px;font-size:10.5px;font-weight:600;color:AC1;}
SLIP .doc-title .refs{margin-top:7px;font-size:9.5px;color:#6b7280;}
SLIP .doc-title .refs b{color:#111827;}
SLIP .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:0;border:1px solid #cbd5e1;border-radius:6px;overflow:hidden;margin-top:12px;}
SLIP .grid .cell{padding:6px 9px;border-right:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;}
SLIP .grid .cell:nth-child(3n){border-right:none;}
SLIP .cell .k{display:block;font-size:8.5px;text-transform:uppercase;letter-spacing:.5px;color:#6b7280;font-weight:600;}
SLIP .cell .v{font-size:11px;font-weight:600;}
SLIP .section-title{margin:14px 0 6px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:AC1;display:flex;align-items:center;gap:8px;}
SLIP .section-title::after{content:"";flex:1;height:1px;background:#cbd5e1;}
SLIP table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums;}
SLIP thead th{background:AC1;color:#fff;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;padding:6px;text-align:left;border:1px solid AC1;}
SLIP thead th.num{text-align:right;}
SLIP tbody td{padding:5px 6px;border:1px solid #e5e7eb;font-size:10.5px;vertical-align:top;}
SLIP td.num,SLIP th.num{text-align:right;white-space:nowrap;}
SLIP td.code{color:#6b7280;font-size:9.5px;white-space:nowrap;}
SLIP td.base,SLIP td.taux{color:#6b7280;font-size:10px;}
SLIP td.gain{color:#065f46;font-weight:600;}
SLIP td.retenue{color:#991b1b;font-weight:600;}
SLIP tr.section td{background:AC3;font-weight:700;font-size:9.5px;text-transform:uppercase;letter-spacing:.6px;color:AC1;padding:5px 6px;}
SLIP tr.total td{background:#f8fafc;font-weight:700;border-top:1.5px solid #cbd5e1;font-size:11px;}
SLIP tr.total td.gain{color:#065f46;}
SLIP tr.total td.retenue{color:#991b1b;}
SLIP tr.subtotal td{background:#fbfcfe;font-weight:600;font-size:10.5px;}
SLIP .net-box{margin-top:14px;display:flex;justify-content:space-between;align-items:center;gap:16px;border:2px solid AC1;border-radius:6px;padding:12px 16px;background:linear-gradient(180deg,#f8faff,AC3);}
SLIP .net-box .label{font-size:11px;text-transform:uppercase;letter-spacing:1.2px;font-weight:700;color:AC1;}
SLIP .net-box .label small{display:block;font-size:9px;letter-spacing:.3px;text-transform:none;font-weight:500;color:#6b7280;margin-top:2px;}
SLIP .net-box .amount{font-size:24px;font-weight:800;color:AC1;font-variant-numeric:tabular-nums;white-space:nowrap;}
SLIP .cumul{margin-top:12px;display:grid;grid-template-columns:repeat(4,1fr);gap:0;border:1px solid #cbd5e1;border-radius:6px;overflow:hidden;}
SLIP .cumul div{padding:7px 9px;border-right:1px solid #e5e7eb;text-align:center;}
SLIP .cumul div:last-child{border-right:none;}
SLIP .cumul .k{display:block;font-size:8.5px;text-transform:uppercase;letter-spacing:.5px;color:#6b7280;font-weight:600;margin-bottom:2px;}
SLIP .cumul .v{font-size:11.5px;font-weight:700;font-variant-numeric:tabular-nums;}
SLIP .footer{margin-top:16px;display:flex;justify-content:space-between;align-items:flex-end;gap:20px;padding-top:10px;border-top:1px solid #cbd5e1;}
SLIP .legal{font-size:8.5px;color:#6b7280;line-height:1.5;max-width:62%;}
SLIP .legal strong{color:#111827;}
SLIP .legal ul{margin:3px 0 0;padding-left:13px;}
SLIP .legal li{margin-bottom:1px;}
SLIP .signature{text-align:center;min-width:150px;}
SLIP .signature .line{width:150px;height:1px;background:#cbd5e1;margin:26px auto 4px;}
SLIP .signature .cap{font-size:8.5px;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;}
SLIP .page-foot{margin-top:10px;text-align:center;font-size:8px;color:#6b7280;letter-spacing:.3px;}
@media (max-width:900px){
  BODY{padding:12px 6px 32px;}
  SLIP .payslip{width:100%;min-height:auto;padding:16px;}
  SLIP .header{flex-direction:column;}
  SLIP .employer,SLIP .doc-title{max-width:100%;min-width:0;text-align:left;}
  SLIP .doc-title{text-align:left;}
  SLIP .grid{grid-template-columns:1fr 1fr;}
  SLIP .grid .cell:nth-child(3n){border-right:1px solid #e5e7eb;}
  SLIP .grid .cell:nth-child(2n){border-right:none;}
  SLIP .cumul{grid-template-columns:1fr 1fr;}
  SLIP .cumul div:nth-child(2n){border-right:none;}
  SLIP .cumul div{border-bottom:1px solid #e5e7eb;}
  SLIP .footer{flex-direction:column;align-items:flex-start;}
  SLIP .legal{max-width:100%;}
  SLIP .table-wrap{overflow-x:auto;}
}
`;
  /* — Variantes par modèle (overrides) — */
  if (O.modele === `classique`) {
    css += `SLIP .m-classique{font-family:Georgia,"Times New Roman","Liberation Serif",serif;}
SLIP .m-classique.payslip{border:3px double #1a1a1a;padding:12mm 14mm;}
SLIP .m-classique .header{flex-direction:column;align-items:center;text-align:center;gap:8px;border-bottom:3px double #1a1a1a;}
SLIP .m-classique .employer{flex-direction:column;align-items:center;max-width:100%;gap:6px;}
SLIP .m-classique .logo{background:#1a1a1a;border-radius:0;}
SLIP .m-classique .employer h1{color:#1a1a1a;letter-spacing:1px;}
SLIP .m-classique .employer p,SLIP .m-classique .employer .meta{color:#4b5563;}
SLIP .m-classique .doc-title{text-align:center;min-width:0;}
SLIP .m-classique .doc-title h2{color:#1a1a1a;letter-spacing:3px;}
SLIP .m-classique .doc-title .sub{background:#fff;color:#1a1a1a;border:1px solid #1a1a1a;border-radius:0;}
SLIP .m-classique .grid{border-color:#1a1a1a;border-radius:0;}
SLIP .m-classique .section-title{color:#1a1a1a;}
SLIP .m-classique .section-title::after{background:none;border-top:1px solid #9ca3af;height:0;}
SLIP .m-classique thead th{background:#1a1a1a;border-color:#1a1a1a;}
SLIP .m-classique tr.section td{background:#ececec;color:#1a1a1a;}
SLIP .m-classique td.gain,SLIP .m-classique tr.total td.gain{color:#1a1a1a;}
SLIP .m-classique td.retenue,SLIP .m-classique tr.total td.retenue{color:#1a1a1a;}
SLIP .m-classique tr.total td{background:#f5f5f5;border-top:2px solid #1a1a1a;}
SLIP .m-classique .net-box{border:3px double #1a1a1a;background:#fff;border-radius:0;}
SLIP .m-classique .net-box .label,SLIP .m-classique .net-box .amount{color:#1a1a1a;}
SLIP .m-classique .net-box .label small{color:#4b5563;}
SLIP .m-classique .cumul{border-color:#1a1a1a;border-radius:0;}
SLIP .m-classique .footer{border-top:2px solid #1a1a1a;}
SLIP .m-classique .signature .line{background:#1a1a1a;}
SLIP .m-classique .page-foot{border-top:1px solid #d1d5db;padding-top:6px;}
`;
  } else if (O.modele === `compact`) {
    css += `SLIP .m-compact.payslip{padding:8mm 9mm 7mm;}
SLIP .m-compact .logo{width:34px;height:34px;flex:0 0 34px;font-size:11px;border-radius:4px;}
SLIP .m-compact .employer h1{font-size:11.5px;}
SLIP .m-compact .employer p{font-size:8.5px;}
SLIP .m-compact .employer .meta{font-size:8px;margin-top:2px;}
SLIP .m-compact .header{padding-bottom:6px;gap:12px;}
SLIP .m-compact .doc-title h2{font-size:14px;letter-spacing:1px;}
SLIP .m-compact .doc-title .sub{font-size:9px;padding:2px 8px;}
SLIP .m-compact .doc-title .refs{font-size:8px;margin-top:4px;}
SLIP .m-compact .grid{margin-top:7px;}
SLIP .m-compact .grid .cell{padding:3px 7px;}
SLIP .m-compact .cell .k{font-size:7.5px;}
SLIP .m-compact .cell .v{font-size:9.5px;}
SLIP .m-compact .section-title{margin:8px 0 4px;font-size:9px;}
SLIP .m-compact thead th{padding:3.5px 5px;font-size:8px;}
SLIP .m-compact tbody td{padding:2.5px 5px;font-size:9px;}
SLIP .m-compact td.code{font-size:8.5px;}
SLIP .m-compact td.base,SLIP .m-compact td.taux{font-size:8.5px;}
SLIP .m-compact tr.section td{padding:3px 5px;font-size:8.5px;}
SLIP .m-compact tr.total td{font-size:9.5px;}
SLIP .m-compact tr.subtotal td{font-size:9px;}
SLIP .m-compact .net-box{margin-top:8px;padding:7px 12px;border-width:1.5px;}
SLIP .m-compact .net-box .label{font-size:9.5px;letter-spacing:.8px;}
SLIP .m-compact .net-box .label small{font-size:8px;}
SLIP .m-compact .net-box .amount{font-size:17px;}
SLIP .m-compact .cumul{margin-top:7px;}
SLIP .m-compact .cumul div{padding:4px 6px;}
SLIP .m-compact .cumul .k{font-size:7.5px;}
SLIP .m-compact .cumul .v{font-size:9.5px;}
SLIP .m-compact .footer{margin-top:8px;padding-top:6px;gap:14px;}
SLIP .m-compact .legal{font-size:7.5px;}
SLIP .m-compact .legal ul{padding-left:11px;}
SLIP .m-compact .signature{min-width:120px;}
SLIP .m-compact .signature .line{margin-top:18px;width:130px;}
SLIP .m-compact .signature .cap{font-size:7.5px;}
SLIP .m-compact .page-foot{margin-top:6px;font-size:7.5px;}
`;
  } else if (O.modele === `elegance`) {
    css += `SLIP .m-elegance.payslip{padding:0 0 10px;box-shadow:0 8px 36px rgba(15,23,42,.18);}
SLIP .m-elegance .header{background:AC1;margin:0;padding:18px 22px;border-bottom:none;color:#fff;align-items:center;}
SLIP .m-elegance .logo{background:rgba(255,255,255,.16);color:#fff;border:1px solid rgba(255,255,255,.35);border-radius:12px;}
SLIP .m-elegance .employer h1{color:#fff;}
SLIP .m-elegance .employer p,.m-elegance .employer .meta{color:rgba(255,255,255,.85);}
SLIP .m-elegance .doc-title h2{color:#fff;letter-spacing:2px;}
SLIP .m-elegance .doc-title .sub{background:rgba(255,255,255,.16);border-color:rgba(255,255,255,.4);color:#fff;}
SLIP .m-elegance .doc-title .refs{color:rgba(255,255,255,.85);}
SLIP .m-elegance .doc-title .refs b{color:#fff;}
SLIP .m-elegance .grid,SLIP .m-elegance .section-title,SLIP .m-elegance .table-wrap,SLIP .m-elegance .net-box,SLIP .m-elegance .cumul,SLIP .m-elegance .footer{margin-left:18px;margin-right:18px;}
SLIP .m-elegance .grid{border-radius:10px;border-color:#d8dee9;margin-top:16px;}
SLIP .m-elegance thead th{border-radius:6px 6px 0 0;border-color:AC1;}
SLIP .m-elegance tbody td{border-left:none;border-right:none;}
SLIP .m-elegance table{border:1px solid #e5e7eb;}
SLIP .m-elegance tr.total td{border-top:1.5px solid AC4;}
SLIP .m-elegance .net-box{border-radius:12px;background:linear-gradient(180deg,#fff,AC3);box-shadow:0 4px 18px rgba(15,23,42,.1);}
SLIP .m-elegance .cumul{border-radius:10px;border-color:#d8dee9;}
SLIP .m-elegance .footer{border-top:none;}
SLIP .m-elegance .signature .line{background:#9aa4b2;}
SLIP .m-elegance .page-foot{padding:0 18px;}
`;
  }
  if (mode === `dialog`) {
    css +=
      sc + `.payslip{width:100%;min-height:auto;max-width:860px;padding:18px 20px 12px;box-shadow:none;border-radius:0;}\n` +
      sc + `{padding:0;background:transparent;}\n` +
      sc + `.page-foot{margin-top:8px;padding-bottom:6px;}\n`;
  } else {
    css += `@page{size:A4;margin:8mm;}
@media print{
  BODY{background:#fff;padding:0;font-size:10px;}
  SLIP .toolbar{display:none!important;}
  SLIP .payslip{width:auto;min-height:auto;margin:0;padding:0;box-shadow:none;border-radius:0;}
  SLIP thead th{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  SLIP tr.section td,SLIP .net-box,SLIP .doc-title .sub,SLIP .logo,SLIP .m-elegance .header{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  SLIP .net-box{break-inside:avoid;}
  SLIP table{break-inside:auto;}
  SLIP tr{break-inside:avoid;}
  SLIP .grid{grid-template-columns:repeat(3,1fr);}
  SLIP .grid .cell{border-right:1px solid #e5e7eb;}
  SLIP .grid .cell:nth-child(3n){border-right:none;}
  SLIP .m-classique.payslip{padding:6mm 8mm;}
  SLIP .m-compact.payslip{padding:0 2mm;}
}
`;
  }
  return css
    .split(`AC1`).join(AC.main)
    .split(`AC2`).join(AC.dark)
    .split(`AC3`).join(AC.soft)
    .split(`AC4`).join(AC.brd)
    .split(`SLIP `).join(sc)
    .split(`BODY`).join(bb);
}
/* — BULLETIN DE PAIE V5 : corps du document multi-modèles (moderne /
   classique / compact / élégance), personnalisable (couleur, logo, titre,
   sections affichées, mention) + document d'impression autonome. — */
function paBulBody(BT, rw, O) {
  O = O || paBulOpts(null);
  var emp = BT.emp;
  var stLb = (PA_ST[rw.statut] || [rw.statut || `—`])[0];
  var auj = new Date().toISOString().slice(0, 10);
  var nom = emp.civilite
    ? emp.civilite + ` ` + (emp.prenom || ``) + ` ` + (emp.nom || ``)
    : emp.nom || emp.prenom || rw.employee_id;
  var mat = emp.matricule || rw.employee_id;
  var brut = rw.salaire_brut || 0;
  var logo =
    O.logo ||
    (String(BT.raison).split(/\s+/).filter(Boolean).slice(0, 2)
      .map(function (w) { return (w[0] || ``).toUpperCase(); })
      .join(``) || `EM`);
  var cell = function (k, v) {
    return (
      `<div class="cell"><span class="k">` + paBulEsc(k) +
      `</span><span class="v">` + paBulEsc(v == null || v === `` ? `—` : v) + `</span></div>`
    );
  };
  var gRow = function (code, lbl, bs, tx, amt) {
    return (
      `<tr><td class="code">` + paBulEsc(code) + `</td><td>` + paBulEsc(lbl) +
      `</td><td class="num base">` + paBulEsc(bs || `—`) + `</td><td class="num taux">` + paBulEsc(tx || `—`) +
      `</td><td class="num gain">` + (amt == null ? `` : paBulFmt(amt)) + `</td><td class="num"></td></tr>`
    );
  };
  var rRow = function (code, lbl, bs, tx, amt) {
    return (
      `<tr><td class="code">` + paBulEsc(code) + `</td><td>` + paBulEsc(lbl) +
      `</td><td class="num base">` + paBulEsc(bs || `—`) + `</td><td class="num taux">` + paBulEsc(tx || `—`) +
      `</td><td class="num"></td><td class="num retenue">` + (amt == null ? `` : paBulFmt(amt)) + `</td></tr>`
    );
  };
  var pRow = function (code, lbl, tx, amt) {
    return (
      `<tr><td class="code">` + paBulEsc(code) + `</td><td>` + paBulEsc(lbl) +
      `</td><td class="num base">` + paBulFmt(brut) + `</td><td class="num taux">` + paBulEsc(tx) +
      `</td><td class="num"></td><td class="num retenue">` + paBulFmt(amt) + `</td></tr>`
    );
  };
  var txIrpp =
    brut > 0 && BT.irpp > 0
      ? String(Math.round((BT.irpp / brut) * 10000) / 100).replace(`.`, `,`) + ` %`
      : `—`;
  var retSum = (rw.retenue_absences || 0) + (rw.cotisations || 0) + (rw.pret_retenue || 0);
  var ecart = BT.gains - BT.net - retSum;
  var rows =
    `<tr class="section"><td colspan="6">I — Éléments de rémunération</td></tr>` +
    gRow(`1000`, `Salaire de base (mois)`, `1 mois`, `—`, rw.salaire_base || 0) +
    gRow(
      `1010`,
      `Heures supplémentaires` + (BT.hsH > 0 ? ` — majorations décret n° 93/184` : ` (aucune)`),
      BT.hsH > 0 ? BT.hsH + ` h` : `—`,
      BT.hsH > 0 && (rw.hs_montant || 0) > 0
        ? paBulFmt(Math.round((rw.hs_montant || 0) / BT.hsH)) + ` /h`
        : `—`,
      rw.hs_montant || 0
    ) +
    `<tr class="total"><td colspan="4">Total brut</td><td class="num gain">` +
    paBulFmt(BT.gains) + `</td><td class="num"></td></tr>` +
    `<tr class="section"><td colspan="6">II — Retenues et contributions salariales</td></tr>` +
    rRow(`2000`, `Absences non travaillées — art. 86 du Code du travail`, (rw.jours_absents || 0) + ` j`, `—`, rw.retenue_absences || 0) +
    rRow(`2010`, `CNPS — pension de vieillesse (part salariale)`, paBulFmt(brut), `4,2 %`, BT.cnps) +
    rRow(`2020`, `Impôt sur le revenu (IRPP) & contributions fiscales`, paBulFmt(brut), txIrpp, BT.irpp) +
    ((rw.pret_retenue || 0) > 0
      ? rRow(`2030`, `Remboursement de prêt / avance sur salaire`, `mensualité`, `—`, rw.pret_retenue)
      : ``) +
    (ecart >= 1
      ? rRow(`2090`, `Ajustement — plafonnement du brut imposable`, `—`, `—`, ecart)
      : ecart <= -1
        ? gRow(`1090`, `Ajustement — régularisation`, `—`, `—`, -ecart)
        : ``) +
    `<tr class="total"><td colspan="4">Total des retenues salariales</td><td class="num"></td><td class="num retenue">` +
    paBulFmt(BT.gains - BT.net) + `</td></tr>`;
  if (O.patronal)
    rows +=
      `<tr class="section"><td colspan="6">III — Contributions patronales (pour information — non déduites du net)</td></tr>` +
      pRow(`3000`, `Prestations familiales (CNPS)`, `7 %`, BT.patronal[0].montant) +
      pRow(`3010`, `Pension de vieillesse — part patronale (CNPS)`, `4,2 %`, BT.patronal[1].montant) +
      pRow(`3020`, `Accidents du travail & maladies professionnelles (CNPS)`, `2,5 %`, BT.patronal[2].montant) +
      pRow(`3030`, `FNE — Fonds National de l'Emploi`, `1 %`, BT.patronal[3].montant) +
      `<tr class="subtotal"><td colspan="4">Total des contributions patronales (14,7 %)</td><td class="num"></td><td class="num retenue">` +
      paBulFmt(BT.patTot) + `</td></tr>` +
      `<tr class="subtotal"><td colspan="4">Coût total employeur (brut + charges patronales)</td><td class="num gain">` +
      paBulFmt(brut + BT.patTot) + `</td><td class="num"></td></tr>`;
  var cumulBlock = ``;
  if (O.cumuls)
    cumulBlock =
      `<h3 class="section-title">Cumuls de l'exercice ` + paBulEsc(BT.k.an) + ` et congés</h3>` +
      `<div class="cumul">` +
      `<div><span class="k">Brut cumulé</span><span class="v">` + paBulFmt(BT.cumuls.brut) + ` FCFA</span></div>` +
      `<div><span class="k">Retenues cumulées</span><span class="v">` + paBulFmt(BT.cumuls.charges) + ` FCFA</span></div>` +
      `<div><span class="k">Net payé cumulé</span><span class="v">` + paBulFmt(BT.cumuls.net) + ` FCFA</span></div>` +
      (O.cumuls && BT.conges
        ? `<div><span class="k">Congés ` + paBulEsc(BT.k.an) + ` — solde</span><span class="v">` + BT.conges.solde + ` j</span></div>`
        : `<div><span class="k">Charges patronales cumulées (info)</span><span class="v">` + paBulFmt(BT.patTot) + ` FCFA</span></div>`) +
      `</div>`;
  var legalLis = ``;
  if (O.mentions)
    legalLis =
      `<div class="legal">` +
      `<strong>Mentions légales et informations</strong>` +
      `<ul>` +
      `<li>Bulletin établi conformément au Code du travail (retenue pour absences — art. 86&nbsp;; heures supplémentaires — art. 90, majorations décret n° 93/184) et à la réglementation CNPS.</li>` +
      `<li>À conserver <strong>sans limitation de durée</strong> — document à produire en cas de litige ou de demande de retraite (convention n° 95 de l'OIT sur la protection du salaire).</li>` +
      `<li>Charges salariales au taux contractuel global de ` + paBulEsc(rw.taux_charges || 0) + ` % — décomposition indicative&nbsp;: CNPS 4,2&nbsp;% + IRPP (configurable dans Paramètres).</li>` +
      `<li>Paiement par ` + paBulEsc(rw.mode_paie || `—`) +
      (rw.reference ? ` — réf. ` + paBulEsc(rw.reference) : ``) +
      ` — Devise&nbsp;: FCFA (XAF) — Généré électroniquement le ` + paBulEsc(auj) + `.</li>` +
      (O.mention ? `<li>` + paBulEsc(O.mention) + `</li>` : ``) +
      `</ul>` +
      `</div>`;
  else if (O.mention)
    legalLis = `<div class="legal"><ul><li>` + paBulEsc(O.mention) + `</li></ul></div>`;
  var footInner = legalLis + (O.signature
    ? `<div class="signature"><div class="line" aria-hidden="true"></div><span class="cap">Pour l'employeur</span></div>`
    : ``);
  var foot = footInner ? `<footer class="footer">` + footInner + `</footer>` : ``;
  return (
    `<article class="payslip m-` + O.modele + `" aria-label="Bulletin de paie">` +
    `<header class="header">` +
    `<div class="employer">` +
    `<div class="logo` + (O.logoData ? ` hasimg` : ``) + `" aria-hidden="true">` +
    (O.logoData ? `<img src="` + O.logoData + `" alt="">` : paBulEsc(logo)) + `</div>` +
    `<div><h1>` + paBulEsc(BT.raison) + `</h1>` +
    `<p>` + paBulEsc(BT.adresse) + `</p>` +
    `<p class="meta">RCCM&nbsp;: ` + paBulEsc(BT.rccm) + ` · NIU&nbsp;: ` + paBulEsc(BT.niu) +
    ` · N° CNPS&nbsp;: ` + paBulEsc(BT.cnpsEmp) + `</p></div>` +
    `</div>` +
    `<div class="doc-title">` +
    `<h2>` + paBulEsc(O.titre) + `</h2>` +
    `<span class="sub">Période&nbsp;: ` + paBulEsc(BT.periode) + `</span>` +
    `<p class="refs">Bulletin n°&nbsp;: <b>` + paBulEsc(BT.num) + `</b><br>` +
    `Paiement le&nbsp;: <b>` + paBulEsc(rw.paye_le || `—`) + `</b><br>` +
    `Statut&nbsp;: <b>` + paBulEsc(stLb) + `</b></p>` +
    `</div>` +
    `</header>` +
    `<div class="grid">` +
    cell(`Nom et prénoms`, nom) +
    cell(`Matricule`, mat) +
    cell(`Département`, emp.departement) +
    cell(`Emploi / Qualification`, emp.poste ? emp.poste + (emp.categorie ? ` — Cat. ` + emp.categorie : ``) : emp.categorie) +
    cell(`Type de contrat`, emp.type_contrat) +
    cell(`Date d'entrée`, emp.date_embauche) +
    cell(`Ancienneté`, BT.anciennete || `—`) +
    cell(`Statut`, emp.regime_travail) +
    cell(`Mode de paiement`, (rw.mode_paie || `—`) + (rw.reference ? ` — ` + rw.reference : ``)) +
    `</div>` +
    `<h3 class="section-title">Rémunération et cotisations</h3>` +
    `<div class="table-wrap"><table>` +
    `<caption class="sr-only">Détail de la rémunération, des retenues salariales et des contributions patronales</caption>` +
    `<thead><tr>` +
    `<th scope="col" style="width:7%">Code</th>` +
    `<th scope="col" style="width:35%">Désignation</th>` +
    `<th scope="col" class="num" style="width:12%">Base</th>` +
    `<th scope="col" class="num" style="width:10%">Taux</th>` +
    `<th scope="col" class="num" style="width:18%">Gains (FCFA)</th>` +
    `<th scope="col" class="num" style="width:18%">Retenues (FCFA)</th>` +
    `</tr></thead><tbody>` + rows + `</tbody></table></div>` +
    `<div class="net-box">` +
    `<div class="label">Net à payer` +
    `<small>Brut ` + paBulFmt(BT.gains) + ` − Retenues ` + paBulFmt(BT.gains - BT.net) + ` FCFA</small>` +
    `<small>Arrêté le présent bulletin à la somme de&nbsp;: ` + paBulEsc(BT.lettres) + ` francs CFA.</small>` +
    `</div>` +
    `<div class="amount">` + paBulFmt(BT.net) + ` FCFA</div>` +
    `</div>` +
    cumulBlock +
    foot +
    `<p class="page-foot">` + paBulEsc(BT.raison) + ` — Document généré électroniquement · Bulletin n° ` +
    paBulEsc(BT.num) + ` · Page 1/1</p>` +
    `</article>`
  );
}
function paBulletinHTML(rw, mt) {
  var O = paBulOpts(mt);
  if (O.tpl) return paTplHTML(rw, mt, O.tpl, O);
  var BT = paBulData(rw, mt);
  return (
    `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">` +
    `<meta name="viewport" content="width=device-width, initial-scale=1">` +
    `<title>` + paBulEsc(O.titre) + ` — ` + paBulEsc(BT.periode) + `</title>` +
    `<style>` + paBulCSS(`print`, O) + `</style></head><body>` +
    `<div class="toolbar"><button class="btn" onclick="window.print()">Imprimer / PDF</button></div>` +
    paBulBody(BT, rw, O) +
    `</body></html>`
  );
}
/* ================================================================
   CRÉATEUR DE MODÈLES DE BULLETIN — moteur de formules (v6).
   Un modèle = { nom, entreprise, devise, deviseLettres, decimales,
   rubriques[], apparence } — créé de A à Z par l'administrateur RH.
   Chaque rubrique possède une FORMULE évaluée pour N'IMPORTE QUEL
   employé (adaptable à tous les pays / fiscalités) :
     · variables  : base, brut, hs, hsHeures, joursAbsents,
                    ancienneteMois, ancienneteAnnees, nbEnfants,
                    tauxHoraire, mois, an
     · références : [CODE] = valeur d'une rubrique précédente
     · fonctions  : MIN(a,b,..) MAX(a,b,..) ROUND(x,n) ABS(x)
   Évaluation SÉCURISÉE : whitelist de caractères + identifiants,
   puis new Function à arguments injectés (aucun eval libre).
   ================================================================ */
var PA_TPL_FN = { MIN: 1, MAX: 1, ROUND: 1, ABS: 1 };
var PA_TPL_VARS = {
  base: 1,
  brut: 1,
  hs: 1,
  hsHeures: 1,
  joursAbsents: 1,
  ancienneteMois: 1,
  ancienneteAnnees: 1,
  nbEnfants: 1,
  tauxHoraire: 1,
  mois: 1,
  an: 1,
};
var PA_TPL_VARLIST = Object.keys(PA_TPL_VARS);
var PA_DEVISES_LETTRES = {
  FCFA: `francs CFA`,
  XAF: `francs CFA`,
  XOF: `francs CFA`,
  EUR: `euros`,
  USD: `dollars américains`,
  GBP: `livres sterling`,
  CHF: `francs suisses`,
  MAD: `dirhams`,
  DZD: `dinars algériens`,
  TND: `dinars tunisiens`,
  CAD: `dollars canadiens`,
  BRL: `réais`,
  INR: `roupies`,
  CNY: `yuans`,
};
function paDeviseLettres(T) {
  var d = String((T && T.devise) || ``).toUpperCase();
  return String((T && T.deviseLettres) || ``).trim() || PA_DEVISES_LETTRES[d] || d;
}
function paDeviseFmt(n, T) {
  var dec = T && T.decimales === 2 ? 2 : 0;
  var v = Number(n) || 0;
  try {
    return new Intl.NumberFormat(`fr-FR`, {
      minimumFractionDigits: dec,
      maximumFractionDigits: dec,
    }).format(v);
  } catch (err) {
    return String(Math.round(v));
  }
}
/* — Contexte d'évaluation d'un employé pour un mois donné. — */
function paTplCtx(rw) {
  var emp = rw.emp || R(rw.employee_id) || {};
  var k = paDeKey(rw.mois) || { an: new Date().getFullYear(), mois: new Date().getMonth() + 1 };
  var base = Math.round(Number(rw.salaire_base) || 0);
  var ancMois = 0;
  var em = emp && emp.date_embauche ? new Date(emp.date_embauche) : null;
  if (em && !isNaN(em.getTime())) {
    var ref = new Date(Date.UTC(k.an, k.mois, 0));
    ancMois = (ref.getUTCFullYear() - em.getFullYear()) * 12 + (ref.getUTCMonth() - em.getMonth());
    if (ancMois < 0) ancMois = 0;
  }
  return {
    base: base,
    brut: 0, /* cumul des gains déjà calculés — mis à jour ligne à ligne */
    hs: Math.round(Number(rw.hs_montant) || 0),
    hsHeures: paHSHeuresMois(rw.employee_id, k.an, k.mois),
    joursAbsents: Number(rw.jours_absents) || 0,
    ancienneteMois: ancMois,
    ancienneteAnnees: Math.floor(ancMois / 12),
    nbEnfants: Number(emp.nombre_enfants) || 0,
    tauxHoraire: Math.round((base / 173.33) * 100) / 100,
    mois: k.mois,
    an: k.an,
  };
}
/* — Évaluation sécurisée d'une formule. Retourne NaN si invalide. — */
function paTplEval(expr, ctx, vals) {
  var e = String(expr == null ? `` : expr).trim();
  if (!e) return 0;
  e = e.replace(/\[([A-Za-z0-9_\-]+)\]/g, function (_, c) {
    return `(` + (vals && Object.prototype.hasOwnProperty.call(vals, c) ? Number(vals[c]) || 0 : 0) + `)`;
  });
  if (!/^[-+*/(). ,0-9A-Za-z_]*$/.test(e)) return NaN;
  var ids = e.match(/[A-Za-z_][A-Za-z0-9_]*/g) || [];
  for (var i = 0; i < ids.length; i++) {
    if (!PA_TPL_FN[ids[i]] && !PA_TPL_VARS[ids[i]]) return NaN;
  }
  function ROUND(x2, n2) {
    var p2 = Math.pow(10, Number(n2) || 0);
    return Math.round((Number(x2) || 0) * p2) / p2;
  }
  try {
    var f = new Function(
      PA_TPL_VARLIST.join(`,`),
      `MIN`,
      `MAX`,
      `ROUND`,
      `ABS`,
      `return (` + e + `);`,
    );
    var args = PA_TPL_VARLIST.map(function (v2) {
      return Number(ctx[v2]) || 0;
    });
    args.push(
      function () {
        return Math.min.apply(null, Array.prototype.map.call(arguments, Number));
      },
      function () {
        return Math.max.apply(null, Array.prototype.map.call(arguments, Number));
      },
      ROUND,
      function (x2) {
        return Math.abs(Number(x2) || 0);
      },
    );
    var out = f.apply(null, args);
    return typeof out === `number` && isFinite(out) ? out : NaN;
  } catch (err) {
    return NaN;
  }
}
/* — Calcule TOUTES les rubriques d'un modèle pour un bulletin rw.
   lc = appel léger (cumuls omis) utilisé par paCumulsCustom pour éviter
   la récursion infinie paTplCalc → paCumulsCustom → paTplCalc. — */
function paTplCalc(T, rw, lc) {
  var ctx = paTplCtx(rw);
  var emp = rw.emp || R(rw.employee_id) || {};
  var k = ctx;
  var vals = {};
  var lignes = [];
  var erreurs = [];
  var totGains = 0,
    totRetenues = 0,
    totPatronal = 0;
  (T && T.rubriques ? T.rubriques : []).forEach(function (r) {
    var v = paTplEval(r.formule, ctx, vals);
    if (isNaN(v)) {
      erreurs.push((r.libelle || r.code || `Rubrique`) + ` : formule invalide`);
      v = 0;
    }
    vals[String(r.code || ``)] = v;
    var lg = {
      code: String(r.code || ``),
      libelle: String(r.libelle || `—`),
      type: r.type === `retenue` || r.type === `patronal` ? r.type : `gain`,
      montant: v,
      baseLbl: String(r.baseLbl || ``),
      tauxLbl: String(r.tauxLbl || ``),
    };
    lignes.push(lg);
    if (lg.type === `gain`) {
      totGains += v;
      ctx.brut = totGains;
    } else if (lg.type === `retenue`) totRetenues += v;
    else totPatronal += v;
  });
  var net = totGains - totRetenues;
  var mt = paMeta(paStore());
  var ent = (T && T.entreprise) || {};
  var raison = String(ent.raison || mt.empRaison || `Employeur`);
  var k2 = paDeKey(rw.mois) || { an: ctx.an, mois: ctx.mois };
  return {
    emp: emp,
    k: k2,
    periode: paMoisLong(k2),
    num:
      `BL-` + k2.an + `-` + (k2.mois < 10 ? `0` : ``) + k2.mois + `-` +
      (emp.matricule || rw.employee_id),
    lignes: lignes,
    erreurs: erreurs,
    totGains: totGains,
    totRetenues: totRetenues,
    totPatronal: totPatronal,
    net: net,
    lettres: paEnLettres(net),
    devise: String(T && T.devise) || `FCFA`,
    decimales: T && T.decimales === 2 ? 2 : 0,
    cumuls: lc ? { brut: 0, net: 0, charges: 0 } : paCumulsCustom(T, rw),
    conges: paCongesInfo(rw.employee_id, k2.an, emp),
    anciennete: paAnciennete(emp, k2.an),
    raison: raison,
    adresse: String(ent.adresse || mt.empAdresse || `—`),
    ids: (ent.ids || []).filter(function (x2) {
      return x2 && (x2.label || x2.valeur);
    }),
    pays: String(ent.pais || ent.pays || ``),
    logoData: String(ent.logoData || ``),
  };
}
/* — Cumuls exercice recalculés AVEC le modèle (adaptés à sa fiscalité). — */
function paCumulsCustom(T, rw) {
  var k = paDeKey(rw.mois) || { an: 0, mois: 0 };
  var cB = 0,
    cN = 0;
  paToutes().forEach(function (r2) {
    if (r2.employee_id !== rw.employee_id) return;
    if (r2.statut === `rejetee`) return;
    var k2 = paDeKey(r2.mois);
    if (!k2 || String(k2.an) !== String(k.an) || k2.mois > k.mois) return;
    var c = paTplCalc(T, r2, !0);
    cB += c.totGains;
    cN += c.net;
  });
  cB = Math.round(cB * 100) / 100;
  cN = Math.round(cN * 100) / 100;
  return { brut: cB, net: cN, charges: Math.round((cB - cN) * 100) / 100 };
}
/* — Validation d'un modèle avant enregistrement. — */
function paTplValide(T) {
  var errs = [];
  if (!T) return [`Modèle vide`];
  if (!String(T.nom || ``).trim()) errs.push(`Nom du modèle obligatoire`);
  var codes = {};
  var vus = {};
  (T.rubriques || []).forEach(function (r, i2) {
    var lb = String(r.libelle || ``).trim();
    var cd = String(r.code || ``).trim();
    var pos = i2 + 1;
    if (!lb) errs.push(`Rubrique ` + pos + ` : libellé obligatoire`);
    if (!cd) errs.push(`Rubrique ` + pos + ` : code obligatoire`);
    else if (codes[cd]) errs.push(`Rubrique ` + pos + ` : code « ` + cd + ` » déjà utilisé`);
    else codes[cd] = 1;
    var f = String(r.formule || ``).trim();
    if (!f) errs.push(`Rubrique ` + pos + ` (« ` + (lb || cd) + ` ») : formule obligatoire`);
    var probe = paTplEval(f, paTplCtx({ employee_id: `x`, mois: `2026-01`, salaire_base: 0 }), {});
    if (f && isNaN(probe))
      errs.push(`Rubrique ` + pos + ` (« ` + (lb || cd) + ` ») : formule invalide (variables : base, brut, hs, [CODE]…)`);
    (String(f).match(/\[([A-Za-z0-9_\-]+)\]/g) || []).forEach(function (ref) {
      var c2 = ref.slice(1, -1);
      if (!codes[c2] && !vus[c2])
        errs.push(`Rubrique ` + pos + ` : référence « ` + ref + ` » inconnue ou placée après la rubrique visée`);
    });
    if (cd) vus[cd] = 1;
  });
  if ((T.rubriques || []).length === 0) errs.push(`Ajoutez au moins une rubrique`);
  return errs;
}
/* — Modèle vierge prérempli depuis les paramètres employeur. — */
function paTplNew(mt) {
  mt = mt || {};
  var ids = [
    { label: `RCCM`, valeur: String(mt.empRccm || ``) },
    { label: `NIU`, valeur: String(mt.empNiu || ``) },
    { label: `N° CNPS`, valeur: String(mt.empCnpsEmp || ``) },
  ].filter(function (x2) {
    return x2.valeur;
  });
  return {
    id: `tpl-` + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36),
    nom: `Nouveau modèle`,
    entreprise: {
      raison: String(mt.empRaison || ``),
      adresse: String(mt.empAdresse || ``),
      pays: ``,
      ids: ids,
      logoData: ``,
      logoInitiales: ``,
    },
    devise: `FCFA`,
    deviseLettres: `francs CFA`,
    decimales: 0,
    rubriques: [
      { code: `1000`, libelle: `Salaire de base`, type: `gain`, formule: `base`, baseLbl: `1 mois`, tauxLbl: `` },
    ],
    apparence: {
      layout: `moderne`,
      accent: `#1e3a8a`,
      titre: `Bulletin de paie`,
      patronal: 1,
      cumuls: 1,
      mentions: 1,
      signature: 1,
      mention: ``,
    },
  };
}
/* — Exemples SIMPLIFIÉS de fiscalité (point de départ à adapter). — */
function paTplExempleCM(mt) {
  var T = paTplNew(mt);
  T.nom = `Exemple Cameroun (CNPS + IRPP)`;
  T.devise = `FCFA`;
  T.deviseLettres = `francs CFA`;
  T.rubriques = [
    { code: `1000`, libelle: `Salaire de base`, type: `gain`, formule: `base`, baseLbl: `1 mois`, tauxLbl: `` },
    { code: `1010`, libelle: `Heures supplémentaires`, type: `gain`, formule: `hs`, baseLbl: `Heures du mois`, tauxLbl: `` },
    { code: `1020`, libelle: `Prime d'ancienneté`, type: `gain`, formule: `ROUND(base * 0.02 * ancienneteAnnees, 0)`, baseLbl: `Salaire de base`, tauxLbl: `2 % / an` },
    { code: `2000`, libelle: `Absences non travaillées`, type: `retenue`, formule: `ROUND(base / 26 * joursAbsents, 0)`, baseLbl: `Jours absents`, tauxLbl: `base / 26` },
    { code: `2010`, libelle: `CNPS — pension de vieillesse (part salariale)`, type: `retenue`, formule: `ROUND(brut * 4.2 / 100, 0)`, baseLbl: `Brut`, tauxLbl: `4,2 %` },
    { code: `2020`, libelle: `Impôt sur le revenu (IRPP) & contributions`, type: `retenue`, formule: `ROUND(brut * 25 / 100, 0)`, baseLbl: `Brut`, tauxLbl: `25 % (exemple)` },
  ];
  return T;
}
function paTplExempleFR(mt) {
  var T = paTplNew(mt);
  T.nom = `Exemple France (simplifié)`;
  T.devise = `EUR`;
  T.deviseLettres = `euros`;
  T.decimales = 2;
  T.rubriques = [
    { code: `1000`, libelle: `Salaire brut mensuel`, type: `gain`, formule: `base`, baseLbl: `1 mois`, tauxLbl: `` },
    { code: `1010`, libelle: `Heures supplémentaires`, type: `gain`, formule: `hs`, baseLbl: `Heures du mois`, tauxLbl: `` },
    { code: `2010`, libelle: `Retraite vieillesse — part salarié`, type: `retenue`, formule: `ROUND(brut * 6.9 / 100, 2)`, baseLbl: `Brut`, tauxLbl: `6,90 %` },
    { code: `2020`, libelle: `CSG déductible`, type: `retenue`, formule: `ROUND(brut * 6.8 / 100, 2)`, baseLbl: `Brut`, tauxLbl: `6,80 %` },
    { code: `2021`, libelle: `CSG / CRDS non déductible`, type: `retenue`, formule: `ROUND(brut * 2.9 / 100, 2)`, baseLbl: `Brut`, tauxLbl: `2,90 %` },
    { code: `3010`, libelle: `Sécurité sociale — part patronale`, type: `patronal`, formule: `ROUND(brut * 13 / 100, 2)`, baseLbl: `Brut`, tauxLbl: `≈ 13 %` },
    { code: `3011`, libelle: `Retraite complémentaire — patronale`, type: `patronal`, formule: `ROUND(brut * 4.72 / 100, 2)`, baseLbl: `Brut`, tauxLbl: `4,72 %` },
    { code: `3012`, libelle: `Assurance chômage — patronale`, type: `patronal`, formule: `ROUND(brut * 4.05 / 100, 2)`, baseLbl: `Brut`, tauxLbl: `4,05 %` },
  ];
  return T;
}
/* — Redimensionne un logo téléversé (max 128 px, PNG base64) pour un
   stockage léger et persistant. — */
function paLogoResize(file, cb) {
  try {
    var rd = new FileReader();
    rd.onload = function () {
      var im = new Image();
      im.onload = function () {
        var c = document.createElement(`canvas`);
        var M = 128,
          r = Math.min(1, M / Math.max(im.width || 1, im.height || 1));
        c.width = Math.max(1, Math.round((im.width || 1) * r));
        c.height = Math.max(1, Math.round((im.height || 1) * r));
        c.getContext(`2d`).drawImage(im, 0, 0, c.width, c.height);
        cb(c.toDataURL(`image/png`));
      };
      im.onerror = function () {
        cb(``);
      };
      im.src = String(rd.result);
    };
    rd.onerror = function () {
      cb(``);
    };
    rd.readAsDataURL(file);
  } catch (err) {
    cb(``);
  }
}
/* ================================================================
   CRÉATEUR DE MODÈLES — rendu du bulletin personnalisé (v6).
   paTplBody : même squelette A4 que les modèles internes (en-tête
   employeur + logo image ou initiales, grille d'identification 3×3,
   tableau Code/Désignation/Base/Taux/Gains/Retenues, net à payer +
   montant en lettres, cumuls recalculés avec les formules du modèle,
   mentions internationales génériques, signature).
   Devise + décimales configurables (tout pays).
   ================================================================ */
function paTplBody(BT, rw, O, T) {
  O = O || paBulOpts(null);
  T = T || O.tpl || {};
  var emp = BT.emp || {};
  var stLb = (PA_ST[rw.statut] || [rw.statut || `—`])[0];
  var auj = new Date().toISOString().slice(0, 10);
  var nom = emp.civilite
    ? emp.civilite + ` ` + (emp.prenom || ``) + ` ` + (emp.nom || ``)
    : emp.nom || emp.prenom || rw.employee_id;
  var mat = emp.matricule || rw.employee_id;
  var dev = BT.devise || `FCFA`;
  var dec = BT.decimales || 0;
  var logo =
    BT.logoData
      ? `<img src="` + BT.logoData + `" alt="">`
      : paBulEsc(
          String((T.entreprise && T.entreprise.logoInitiales) || O.logo || ``).trim() ||
            String(BT.raison).split(/\s+/).filter(Boolean).slice(0, 2)
              .map(function (w) {
                return (w[0] || ``).toUpperCase();
              })
              .join(``) ||
            `EM`,
        );
  var cell = function (k, v) {
    return (
      `<div class="cell"><span class="k">` + paBulEsc(k) +
      `</span><span class="v">` + paBulEsc(v == null || v === `` ? `—` : v) + `</span></div>`
    );
  };
  var gRow = function (l2) {
    return (
      `<tr><td class="code">` + paBulEsc(l2.code) + `</td><td>` + paBulEsc(l2.libelle) +
      `</td><td class="num base">` + paBulEsc(l2.baseLbl || `—`) +
      `</td><td class="num taux">` + paBulEsc(l2.tauxLbl || `—`) +
      `</td><td class="num gain">` + paDeviseFmt(l2.montant, { decimales: dec }) + `</td><td class="num"></td></tr>`
    );
  };
  var rRow = function (l2) {
    return (
      `<tr><td class="code">` + paBulEsc(l2.code) + `</td><td>` + paBulEsc(l2.libelle) +
      `</td><td class="num base">` + paBulEsc(l2.baseLbl || `—`) +
      `</td><td class="num taux">` + paBulEsc(l2.tauxLbl || `—`) +
      `</td><td class="num"></td><td class="num retenue">` + paDeviseFmt(l2.montant, { decimales: dec }) + `</td></tr>`
    );
  };
  var gains = BT.lignes.filter(function (l2) {
    return l2.type === `gain`;
  });
  var retenues = BT.lignes.filter(function (l2) {
    return l2.type === `retenue`;
  });
  var patronal = BT.lignes.filter(function (l2) {
    return l2.type === `patronal`;
  });
  var rows =
    `<tr class="section"><td colspan="6">I — Gains et éléments de rémunération</td></tr>` +
    gains.map(gRow).join(``) +
    `<tr class="total"><td colspan="4">Total des gains</td><td class="num gain">` +
    paDeviseFmt(BT.totGains, { decimales: dec }) + `</td><td class="num"></td></tr>` +
    `<tr class="section"><td colspan="6">II — Retenues et cotisations salariales</td></tr>` +
    retenues.map(rRow).join(``) +
    `<tr class="total"><td colspan="4">Total des retenues</td><td class="num"></td><td class="num retenue">` +
    paDeviseFmt(BT.totRetenues, { decimales: dec }) + `</td></tr>`;
  if (O.patronal && patronal.length)
    rows +=
      `<tr class="section"><td colspan="6">III — Contributions patronales (pour information — non déduites du net)</td></tr>` +
      patronal.map(rRow).join(``) +
      `<tr class="subtotal"><td colspan="4">Total des contributions patronales</td><td class="num"></td><td class="num retenue">` +
      paDeviseFmt(BT.totPatronal, { decimales: dec }) + `</td></tr>` +
      `<tr class="subtotal"><td colspan="4">Coût total employeur (gains + contributions)</td><td class="num gain">` +
      paDeviseFmt(BT.totGains + BT.totPatronal, { decimales: dec }) + `</td><td class="num"></td></tr>`;
  var cumulBlock = ``;
  if (O.cumuls)
    cumulBlock =
      `<h3 class="section-title">Cumuls de l'exercice ` + paBulEsc(BT.k.an) + ` et congés</h3>` +
      `<div class="cumul">` +
      `<div><span class="k">Brut cumulé</span><span class="v">` + paDeviseFmt(BT.cumuls.brut, { decimales: dec }) + ` ` + paBulEsc(dev) + `</span></div>` +
      `<div><span class="k">Retenues cumulées</span><span class="v">` + paDeviseFmt(BT.cumuls.charges, { decimales: dec }) + ` ` + paBulEsc(dev) + `</span></div>` +
      `<div><span class="k">Net cumulé</span><span class="v">` + paDeviseFmt(BT.cumuls.net, { decimales: dec }) + ` ` + paBulEsc(dev) + `</span></div>` +
      `<div><span class="k">Congés ` + paBulEsc(BT.k.an) + ` — solde</span><span class="v">` + paBulEsc(BT.conges ? BT.conges.solde : 0) + ` j</span></div>` +
      `</div>`;
  var metaIds = (BT.ids || [])
    .map(function (x2) {
      return paBulEsc(x2.label || `—`) + `&nbsp;: ` + paBulEsc(x2.valeur || `—`);
    })
    .join(` · `);
  var legalLis = ``;
  if (O.mentions)
    legalLis =
      `<div class="legal">` +
      `<strong>Mentions légales et informations</strong>` +
      `<ul>` +
      `<li>Document établi conformément à la réglementation du travail applicable` +
      (BT.pays ? ` en ` + paBulEsc(BT.pays) : ``) +
      ` — barèmes, cotisations et formules configurés par l'employeur.</li>` +
      `<li>À conserver <strong>sans limitation de durée</strong> — document à produire en cas de litige ou de demande de retraite (convention n° 95 de l'OIT sur la protection du salaire).</li>` +
      `<li>Devise&nbsp;: ` + paBulEsc(dev) + ` — Mode de paiement&nbsp;: ` + paBulEsc(rw.mode_paie || `—`) +
      (rw.reference ? ` — réf. ` + paBulEsc(rw.reference) : ``) +
      ` — Généré électroniquement le ` + paBulEsc(auj) + `.</li>` +
      (O.mention ? `<li>` + paBulEsc(O.mention) + `</li>` : ``) +
      `</ul>` +
      `</div>`;
  else if (O.mention)
    legalLis = `<div class="legal"><ul><li>` + paBulEsc(O.mention) + `</li></ul></div>`;
  var footInner = legalLis + (O.signature
    ? `<div class="signature"><div class="line" aria-hidden="true"></div><span class="cap">Pour l'employeur</span></div>`
    : ``);
  var foot = footInner ? `<footer class="footer">` + footInner + `</footer>` : ``;
  return (
    `<article class="payslip m-` + O.modele + `" aria-label="Bulletin de paie">` +
    `<header class="header">` +
    `<div class="employer">` +
    `<div class="logo` + (BT.logoData ? ` hasimg` : ``) + `" aria-hidden="true">` + logo + `</div>` +
    `<div><h1>` + paBulEsc(BT.raison) + `</h1>` +
    `<p>` + paBulEsc(BT.adresse) + `</p>` +
    (metaIds ? `<p class="meta">` + metaIds + `</p>` : ``) +
    `</div>` +
    `</div>` +
    `<div class="doc-title">` +
    `<h2>` + paBulEsc(O.titre) + `</h2>` +
    `<span class="sub">Période&nbsp;: ` + paBulEsc(BT.periode) + `</span>` +
    `<p class="refs">Bulletin n°&nbsp;: <b>` + paBulEsc(BT.num) + `</b><br>` +
    `Paiement le&nbsp;: <b>` + paBulEsc(rw.paye_le || `—`) + `</b><br>` +
    `Statut&nbsp;: <b>` + paBulEsc(stLb) + `</b></p>` +
    `</div>` +
    `</header>` +
    `<div class="grid">` +
    cell(`Nom et prénoms`, nom) +
    cell(`Matricule`, mat) +
    cell(`Département`, emp.departement) +
    cell(`Emploi / Qualification`, emp.poste ? emp.poste + (emp.categorie ? ` — Cat. ` + emp.categorie : ``) : emp.categorie) +
    cell(`Type de contrat`, emp.type_contrat) +
    cell(`Date d'entrée`, emp.date_embauche) +
    cell(`Ancienneté`, BT.anciennete || `—`) +
    cell(`Statut`, emp.regime_travail) +
    cell(`Mode de paiement`, (rw.mode_paie || `—`) + (rw.reference ? ` — ` + rw.reference : ``)) +
    `</div>` +
    `<h3 class="section-title">Rémunération et cotisations</h3>` +
    `<div class="table-wrap"><table>` +
    `<caption class="sr-only">Détail de la rémunération selon le modèle personnalisé de l'employeur</caption>` +
    `<thead><tr>` +
    `<th scope="col" style="width:7%">Code</th>` +
    `<th scope="col" style="width:35%">Désignation</th>` +
    `<th scope="col" class="num" style="width:12%">Base</th>` +
    `<th scope="col" class="num" style="width:10%">Taux</th>` +
    `<th scope="col" class="num" style="width:18%">Gains (` + paBulEsc(dev) + `)</th>` +
    `<th scope="col" class="num" style="width:18%">Retenues (` + paBulEsc(dev) + `)</th>` +
    `</tr></thead><tbody>` + rows + `</tbody></table></div>` +
    `<div class="net-box">` +
    `<div class="label">Net à payer` +
    `<small>Brut ` + paDeviseFmt(BT.totGains, { decimales: dec }) + ` − Retenues ` + paDeviseFmt(BT.totRetenues, { decimales: dec }) + ` ` + paBulEsc(dev) + `</small>` +
    `<small>Arrêté le présent bulletin à la somme de&nbsp;: ` + paBulEsc(BT.lettres) + ` ` + paBulEsc(paDeviseLettres(T)) + `.</small>` +
    `</div>` +
    `<div class="amount">` + paDeviseFmt(BT.net, { decimales: dec }) + ` ` + paBulEsc(dev) + `</div>` +
    `</div>` +
    cumulBlock +
    foot +
    `<p class="page-foot">` + paBulEsc(BT.raison) + ` — Document généré électroniquement · Bulletin n° ` +
    paBulEsc(BT.num) + ` · Page 1/1</p>` +
    `</article>`
  );
}
/* — Document d'impression autonome (onglet + @page A4). — */
function paTplHTML(rw, mt, T, O) {
  O = O || paBulOpts(mt);
  var BT = paTplCalc(T, rw);
  return (
    `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">` +
    `<meta name="viewport" content="width=device-width, initial-scale=1">` +
    `<title>` + paBulEsc(O.titre) + ` — ` + paBulEsc(BT.periode) + `</title>` +
    `<style>` + paBulCSS(`print`, O) + `</style></head><body>` +
    `<div class="toolbar"><button class="btn" onclick="window.print()">Imprimer / PDF</button></div>` +
    paTplBody(BT, rw, O, T) +
    `</body></html>`
  );
}

function ie({ screen: e }) {
  if (e === `soldes`) return (0, $.jsx)(SoldesV2, {});
  if (e === `absences`) return (0, $.jsx)(AbsencesV2, {});
  if (e === `heures-supp`) return (0, $.jsx)(HeuresSuppV2, {});
  if (e === `pointage`) return (0, $.jsx)(PointageV2, {});
  if (e === `planning`) return (0, $.jsx)(PlanningV2, {});
  if (e === `paie`) return (0, $.jsx)(PaieV2, {});
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
            (0, $.jsx)(c, {
              severity: `error`,
              icon: (0, $.jsx)(w, {}),
              sx: { mb: 2, fontWeight: 600 },
              children: X,
            }),
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
                              a = new Blob([i], {
                                type: `text/csv;charset=utf-8;`,
                              }),
                              o = URL.createObjectURL(a),
                              s = document.createElement(`a`);
                            ((s.href = o),
                              (s.download = `${e}-${new Date().toISOString().slice(0, 10)}.csv`),
                              s.click(),
                              URL.revokeObjectURL(o),
                              L({
                                msg: `${q.length} enregistrement(s) exporté(s) en CSV`,
                                severity: `success`,
                              }));
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
                      startAdornment: (0, $.jsx)(k, {
                        sx: { fontSize: 18, mr: 1, color: `text.secondary` },
                      }),
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
                                {
                                  align: e.align || `left`,
                                  sx: { fontWeight: 700 },
                                  children: e.label,
                                },
                                e.key,
                              ),
                            ),
                            n.canCreate &&
                              (0, $.jsx)(v, {
                                align: `center`,
                                sx: { fontWeight: 700 },
                                children: `Actions`,
                              }),
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
                                          : e[t.key] !== void 0 &&
                                              e[t.key] !== null
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
                                              children: (0, $.jsx)(C, {
                                                fontSize: `small`,
                                              }),
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
                                children: [
                                  `Aucun enregistrement`,
                                  P ? ` trouvé pour cette recherche` : ``,
                                ],
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
                    labelDisplayedRows: ({ from: e, to: t, count: n }) =>
                      `${e}-${t} sur ${n}`,
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
                  sx: {
                    fontWeight: 700,
                    display: `flex`,
                    alignItems: `center`,
                    gap: 1,
                  },
                  children: [
                    (0, $.jsx)(x, { color: `success` }),
                    ` Nouveau — `,
                    n.title,
                  ],
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
                        onChange: (e) =>
                          W({ ...U, employee_id: e.target.value }),
                        children: H.map((e) =>
                          (0, $.jsxs)(
                            s,
                            {
                              value: e.id,
                              children: [
                                e.matricule,
                                ` — `,
                                B(e),
                                ` (`,
                                e.statut,
                                `)`,
                              ],
                            },
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
                              onChange: (e) =>
                                W({ ...U, type_modification: e.target.value }),
                              children: M.type_avenant.map((e) =>
                                (0, $.jsx)(s, { value: e, children: e }, e),
                              ),
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
                                  onChange: (e) =>
                                    W({
                                      ...U,
                                      ancienne_valeur: e.target.value,
                                    }),
                                }),
                                (0, $.jsx)(D, {
                                  size: `small`,
                                  label: `Nouvelle valeur`,
                                  fullWidth: !0,
                                  value: U.nouvelle_valeur || ``,
                                  onChange: (e) =>
                                    W({
                                      ...U,
                                      nouvelle_valeur: e.target.value,
                                    }),
                                }),
                              ],
                            }),
                            (0, $.jsx)(D, {
                              size: `small`,
                              label: `Motif`,
                              fullWidth: !0,
                              value: U.motif || ``,
                              onChange: (e) =>
                                W({ ...U, motif: e.target.value }),
                            }),
                            (0, $.jsx)(D, {
                              type: `date`,
                              size: `small`,
                              label: `Date effet`,
                              fullWidth: !0,
                              value:
                                U.date_effet ||
                                new Date().toISOString().slice(0, 10),
                              onChange: (e) =>
                                W({ ...U, date_effet: e.target.value }),
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
                    (0, $.jsx)(l, {
                      onClick: () => V(!1),
                      children: `Annuler`,
                    }),
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
                            date_effet:
                              U.date_effet ||
                              new Date().toISOString().slice(0, 10),
                            statut: `Active`,
                          }),
                            L({
                              msg: `Avenant ${e} créé avec succès`,
                              severity: `success`,
                            }));
                        } else
                          L({
                            msg: `Enregistrement créé (simulation mock)`,
                            severity: `success`,
                          });
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
    : (0, $.jsx)(a, {
        sx: { p: 3 },
        children: (0, $.jsxs)(i, { children: [`Écran non configuré: `, e] }),
      });
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
  maladie: [
    `Congé maladie`,
    50,
    `art. 86 CT — demi-salaire après 1 an d'ancienneté (plafond 6 mois/an)`,
  ],
  accident_travail: [
    `Accident du travail`,
    100,
    `loi n° 98/004 — prise en charge CNPS · déclaration sous 48 h`,
  ],
  hospitalisation: [
    `Hospitalisation`,
    50,
    `art. 86 CT — demi-salaire sur justificatif`,
  ],
  quarantaine: [`Quarantaine`, 50, `mesure sanitaire — sur justificatif`],
  conge_maternite: [
    `Congé maternité`,
    100,
    `art. 84 CT — 14 semaines, indemnités journalières CNPS`,
  ],
  conge_paternite: [
    `Congé paternité`,
    100,
    `art. 85 CT — 10 jours à la naissance`,
  ],
  absence_autorisee: [
    `Absence autorisée`,
    100,
    `événement familial / autorisation manager`,
  ],
  absence_non_justifiee: [
    `Absence non justifiée`,
    0,
    `aucune indemnité — procédure art. 34-36 CT au-delà de 8 j`,
  ],
};
var ABS_ST = {
  en_attente: [`En attente`, `warning`, `outlined`],
  justifiee: [`Justifiée`, `success`, `outlined`],
  non_justifiee: [`Non justifiée`, `error`, `filled`],
  rejetee: [`Rejetée`, `default`, `outlined`],
};
var ABS_SRC = {
  base: [`Base`, `default`],
  conges: [`Congés V2`, `secondary`],
  v2: [`Déclarée`, `primary`],
};
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
  return (0, $.jsx)(T, {
    label: x2[0],
    size: `small`,
    color: x2[1],
    variant: x2[2],
    sx: { fontWeight: 700, fontSize: `0.7rem` },
  });
}
function absChipSource(src) {
  var x2 = ABS_SRC[src] || [src || `—`, `default`];
  return (0, $.jsx)(T, {
    label: x2[0],
    size: `small`,
    color: x2[1],
    variant: `outlined`,
    sx: { fontWeight: 700, fontSize: `0.62rem`, height: 20 },
  });
}
function absSeed() {
  return re && re.absences && Array.isArray(re.absences.data)
    ? re.absences.data
    : [];
}
function absCongesSante() {
  var out = [];
  try {
    (sldDemandes() || []).forEach((q2) => {
      if (
        q2.type_conge !== `conge_maladie` &&
        q2.type_conge !== `conge_maternite` &&
        q2.type_conge !== `conge_paternite`
      )
        return;
      if (q2.statut === `annulee`) return;
      out.push({
        id: `cg-` + q2.id,
        employee_id: q2.employee_id,
        type_absence:
          q2.type_conge === `conge_maladie` ? `maladie` : q2.type_conge,
        date_debut: q2.date_debut,
        date_fin: q2.date_fin,
        duree_jours: q2.nombre_jours,
        motif: q2.motif || `Congé santé`,
        statut:
          q2.statut === `approuvee`
            ? `justifiee`
            : q2.statut === `en_attente`
              ? `en_attente`
              : `rejetee`,
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
  (st.records || []).forEach((r) =>
    out.push(Object.assign({}, r, { source: `v2` })),
  );
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
    if (
      cnt[an] > max ||
      (cnt[an] === max && an === String(new Date().getFullYear()))
    ) {
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
    cnpsLate:
      r.type_absence === `accident_travail` &&
      !r.cnps_declare &&
      new Date().getTime() - tms > 48 * 36e5,
    visite:
      (r.ouvr || 0) > 3 && !r.visite_prog && r.date_fin && r.date_fin < auj,
    relance: nj && !(r.relances > 0),
    abandon: nj && cumulNJ >= 8,
  };
}
function absBradford(rows) {
  var m = {};
  rows.forEach((r) => {
    if (
      r.statut === `rejetee` ||
      r.type_absence === `conge_maternite` ||
      r.type_absence === `conge_paternite`
    )
      return;
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
/* ===== Absences V3 — pack prioritaire (art. 86 / AT-MP / paie & IJ / pilotage / lettres / certificats) ===== */
var ABS_SANT = { maladie: 1, hospitalisation: 1, quarantaine: 1 };
var ABS_IJCNPS = { accident_travail: 1, conge_maternite: 1 };
var ABS_PAIE = {
  a_payer: [`À payer`, `warning`, `outlined`],
  paye: [`Payé`, `success`, `outlined`],
  a_recuperer: [`Avance à récupérer (CNPS)`, `error`, `filled`],
  recuperee: [`IJ récupérées`, `success`, `outlined`],
};
var ABS_RECO = {
  en_cours: [`En cours d'examen CNPS`, `warning`, `outlined`],
  reconnu: [`Reconnu (AT/MP)`, `success`, `filled`],
  rejete: [`Rejeté`, `error`, `outlined`],
};
function absParam(st) {
  var m = (st && st.meta) || {};
  return {
    coutJour: m.coutJour || 15000,
    plafondMaladie: m.plafondMaladie || 130,
  };
}
function absCertBad(r) {
  if (!r.cert_emis) return ``;
  if (r.date_fin && r.cert_emis > r.date_fin) return `antidate`;
  if (
    r.date_debut &&
    r.cert_emis > r.date_debut &&
    new Date(r.cert_emis) - new Date(r.date_debut) > 7 * 864e5
  )
    return `tardif`;
  return ``;
}
function absPaieInfo(r) {
  var ijAttendue = ABS_IJCNPS[r.type_absence] ? r.indem || 0 : 0;
  var ijRecues = parseFloat(r.ij_recues) || 0;
  var reste = ijAttendue > 0 ? Math.max(0, (r.indem || 0) - ijRecues) : 0;
  var statut = r.paye_statut || (ijAttendue > 0 ? `a_recuperer` : `a_payer`);
  if (statut === `a_recuperer` && reste <= 0 && ijAttendue > 0)
    statut = `recuperee`;
  return {
    statut: statut,
    ijAttendue: ijAttendue,
    ijRecues: ijRecues,
    reste: reste,
  };
}
function absPlafInfo(cumul, plafond) {
  var pct =
    plafond > 0 ? Math.min(100, Math.round((cumul / plafond) * 100)) : 0;
  return {
    pris: cumul,
    plafond: plafond,
    pct: pct,
    etat: pct >= 100 ? `fin` : pct >= 80 ? `proche` : `ok`,
  };
}
function absAtInfo(r) {
  return {
    num: r.at_num || ``,
    decl: r.at_decl || ``,
    reco: r.at_reco || (r.cnps_declare ? `en_cours` : `en_cours`),
    date: r.at_date || r.date_debut || ``,
    heure: r.at_heure || `00:00`,
    rechutes: Array.isArray(r.at_rechutes) ? r.at_rechutes : [],
  };
}
function absDelaiH(r) {
  try {
    var fin =
      r.at_decl && String(r.at_decl).length > 10
        ? r.at_decl
        : r.cnps_date || r.at_decl || ``;
    if (!fin) return null;
    var at = absAtInfo(r);
    var dep = at.date + `T` + String(at.heure || `00:00`).slice(0, 5);
    var h = Math.round(
      (new Date(fin).getTime() - new Date(dep).getTime()) / 36e5,
    );
    return isNaN(h) ? null : h;
  } catch (err) {
    return null;
  }
}
function absMoisSerie(rows, an, fset) {
  var out = [];
  for (var m2 = 1; m2 <= 12; m2++) {
    var mm = m2 < 10 ? `0` + m2 : `` + m2;
    var d1 = an + `-` + mm + `-01`;
    var dernier = new Date(parseInt(an, 10), m2, 0);
    var d2 =
      an +
      `-` +
      mm +
      `-` +
      (dernier.getDate() < 10
        ? `0` + dernier.getDate()
        : `` + dernier.getDate());
    var s = 0;
    (rows || []).forEach(function (rd) {
      if (rd.statut === `rejetee`) return;
      if (!rd.date_debut || !rd.date_fin) return;
      if (rd.date_debut > d2 || rd.date_fin < d1) return;
      var a1 = rd.date_debut > d1 ? rd.date_debut : d1;
      var a2 = rd.date_fin < d2 ? rd.date_fin : d2;
      s += sldOuvrables(a1, a2, fset);
    });
    out.push(s);
  }
  return out;
}
function absDeltaAn(rows, an) {
  function tot(a) {
    var s = 0;
    (rows || []).forEach(function (rd) {
      if (rd.statut === `rejetee`) return;
      if (String(rd.date_debut || ``).slice(0, 4) !== String(a)) return;
      s += rd.ouvr || 0;
    });
    return s;
  }
  var n = tot(an),
    n1 = tot(parseInt(an, 10) - 1);
  return { n: n, n1: n1, d: n - n1 };
}
var ABS_LETTRE_MODELES = [
  [`avertissement`, `Avertissement — absence non justifiée (art. 34-36 CT)`],
  [
    `convocation_visite`,
    `Convocation — visite de reprise (médecine du travail)`,
  ],
  [`relance_certificat`, `Relance — justificatif d'absence (art. 86 CT)`],
  [
    `declaration_at`,
    `Déclaration d'accident du travail — CNPS (loi n° 98/004)`,
  ],
];
function absLettreTexte(tp, det, fdate) {
  if (!det) return ``;
  var auj = fdate(new Date().toISOString().slice(0, 10));
  var nom = det.emp ? B(det.emp) : det.employee_id || ``;
  var mat = (det.emp && det.emp.matricule) || ``;
  var dept = (det.emp && det.emp.departement) || ``;
  var poste = (det.emp && det.emp.poste) || ``;
  var d1 = fdate(det.date_debut),
    d2 = fdate(det.date_fin);
  var dur = det.ouvr || 0;
  var motif = det.motif || `—`;
  var rel = det.relances || 0;
  var ENT = `ADMINA RH — Direction des Ressources Humaines`;
  if (tp === `convocation_visite`)
    return (
      ENT +
      `\nDouala, le ` +
      auj +
      `\n\nOBJET : Convocation à la visite de reprise (médecine du travail)\n\nSalarié : ` +
      nom +
      ` (` +
      mat +
      `)\nDépartement : ` +
      dept +
      `\n\nMadame, Monsieur,\n\nSuite à votre arrêt de travail du ` +
      d1 +
      ` au ` +
      d2 +
      ` (` +
      dur +
      ` j ouvrables, motif : ` +
      motif +
      `), vous êtes convoqué(e) à votre visite de reprise :\n\nDate : ` +
      (det.visite_date
        ? fdate(det.visite_date)
        : `[date à convenir avec la médecine du travail]`) +
      `\nLieu : Infirmerie d'entreprise / Médecine du travail\n\nConformément au règlement intérieur, tout arrêt supérieur à 3 jours ouvrables ouvre droit à une visite de reprise. La présente convocation est à présenter au médecin du travail. Sans présentation à cette visite, la reprise du contrat pourra être différée.\n\nLe service des Ressources Humaines`
    );
  if (tp === `relance_certificat`)
    return (
      ENT +
      `\nDouala, le ` +
      auj +
      `\n\nOBJET : Relance — production du justificatif d'absence (art. 86 CT)\nLettre recommandée / remise en main propre\n\nSalarié : ` +
      nom +
      ` (` +
      mat +
      `)\nDépartement : ` +
      dept +
      `\n\nMadame, Monsieur,\n\nVotre absence du ` +
      d1 +
      ` au ` +
      d2 +
      ` (` +
      dur +
      ` j ouvrables) demeure sans justificatif à ce jour` +
      (rel > 0 ? `, malgré ` + rel + ` relance(s) antérieure(s)` : ``) +
      `.\n\nConformément à l'article 86 du Code du travail, vous devez produire un certificat médical justificatif dans un délai de 48 heures. À défaut de régularisation sous 48 heures, cette absence sera réputée injustifiée : perte de l'indemnisation (taux 0 %), retenue sur salaire, et engagement de la procédure disciplinaire des articles 34 à 36 du Code du travail.\n\nLe service des Ressources Humaines`
    );
  if (tp === `declaration_at`) {
    var at = absAtInfo(det);
    var del = absDelaiH(det);
    return (
      ENT +
      `\nDouala, le ` +
      auj +
      `\n\nCNPS — Caisse Nationale de Prévoyance Sociale\nOBJET : Déclaration d'accident du travail (loi n° 98/004, art. 78)\n\nEmployeur : ADMINA RH\n\nSalarié victime : ` +
      nom +
      ` (` +
      mat +
      `)\nEmploi : ` +
      poste +
      ` — ` +
      dept +
      `\nDate de l'accident : ` +
      fdate(at.date) +
      (at.heure && at.heure !== `00:00` ? ` à ` + at.heure : ``) +
      `\nCirconstances / lésions : ` +
      motif +
      `\nArrêt de travail : du ` +
      d1 +
      ` au ` +
      d2 +
      ` (` +
      dur +
      ` j ouvrables)\n` +
      (del != null
        ? `Délai de déclaration : ` + del + ` h (limite légale : 48 h)\n`
        : ``) +
      `N° de déclaration : ` +
      (at.num || `[à compléter par la CNPS]`) +
      `\n\nNous vous prions de bien vouloir trouver ci-joint le dossier de prise en charge.\n\nCachet et signature du service RH`
    );
  }
  return (
    ENT +
    `\nDouala, le ` +
    auj +
    `\n\nOBJET : Avertissement écrit — absence injustifiée (art. 34 à 36 CT)\n\nSalarié : ` +
    nom +
    ` (` +
    mat +
    `)\nDépartement : ` +
    dept +
    `\n\nMadame, Monsieur,\n\nNous relevons dans votre dossier ` +
    dur +
    ` jour(s) ouvrable(s) d'absence non justifiée` +
    (det.cumulNJ >= 8
      ? ` — le seuil légal de 8 jours ouvrables cumulés est atteint`
      : ``) +
    `, portant sur la période du ` +
    d1 +
    ` au ` +
    d2 +
    ` (motif déclaré : ` +
    motif +
    `)` +
    (rel > 0 ? `, sans réaction à ` + rel + ` relance(s) du service RH` : ``) +
    `.\n\nVous disposez d'un délai de 48 heures pour produire vos justificatifs et/ou vos explications écrites. À défaut, nous engagerons la procédure disciplinaire prévue par les articles 34 à 36 du Code du travail, pouvant conduire, en cas d'abandon de poste caractérisé, à la rupture du contrat de travail à vos torts exclusifs.\n\nNous vous prions d'agréer, Madame, Monsieur, l'expression de nos salutations distinguées.\n\nLe service des Ressources Humaines`
  );
}

function AbsKpi(pg) {
  var IC = pg.ic;
  return (0, $.jsxs)(a, {
    onClick: pg.onClic,
    sx: {
      p: 2,
      borderRadius: 3,
      cursor: `pointer`,
      minWidth: 0,
      bgcolor: `background.paper`,
      background: pg.grad
        ? `linear-gradient(135deg,#7e3ff2 0%,#9d6bff 100%)`
        : undefined,
      color: pg.grad ? `#fff` : `text.primary`,
      border: `1px solid`,
      borderColor: pg.actif ? `#7e3ff2` : `divider`,
      boxShadow: pg.actif ? 4 : 1,
      transition: `box-shadow .2s`,
      "&:hover": { boxShadow: 6 },
    },
    children: [
      (0, $.jsx)(IC, {
        sx: {
          fontSize: 30,
          mb: 0.5,
          color: pg.grad
            ? `rgba(255,255,255,.92)`
            : pg.couleur || `primary.main`,
        },
      }),
      (0, $.jsx)(i, {
        variant: `h5`,
        fontWeight: 800,
        sx: { overflowWrap: `anywhere` },
        children: pg.valeur,
      }),
      (0, $.jsx)(i, {
        variant: `body2`,
        fontWeight: 700,
        sx: { color: pg.grad ? `rgba(255,255,255,.9)` : `text.primary` },
        children: pg.label,
      }),
      pg.sub
        ? (0, $.jsx)(i, {
            variant: `caption`,
            sx: {
              display: `block`,
              mt: 0.5,
              color: pg.grad ? `rgba(255,255,255,.75)` : `text.secondary`,
            },
            children: pg.sub,
          })
        : null,
    ],
  });
}
function AbsTuile(pg) {
  return (0, $.jsxs)(a, {
    sx: {
      border: `1px solid`,
      borderColor: `divider`,
      borderRadius: 2,
      p: 1.5,
      textAlign: `center`,
      bgcolor: `background.default`,
    },
    children: [
      (0, $.jsx)(i, {
        variant: `caption`,
        sx: { color: `text.secondary`, fontWeight: 600 },
        children: pg.label,
      }),
      (0, $.jsx)(i, {
        variant: `h6`,
        fontWeight: 800,
        sx: { color: pg.couleur || `text.primary`, fontSize: `1rem` },
        children: pg.valeur,
      }),
    ],
  });
}
function absChipConf(fl) {
  var out = [];
  if (fl.cnpsLate)
    out.push(
      (0, $.jsx)(T, {
        key: `c`,
        label: `CNPS 48 h dépassé`,
        size: `small`,
        color: `error`,
        variant: `filled`,
        sx: { fontWeight: 700, fontSize: `0.62rem` },
      }),
    );
  else if (fl.cnps)
    out.push(
      (0, $.jsx)(T, {
        key: `c`,
        label: `CNPS à déclarer`,
        size: `small`,
        color: `warning`,
        variant: `outlined`,
        sx: { fontWeight: 700, fontSize: `0.62rem` },
      }),
    );
  if (fl.visite)
    out.push(
      (0, $.jsx)(T, {
        key: `v`,
        label: `Visite reprise due`,
        size: `small`,
        color: `warning`,
        variant: `outlined`,
        sx: { fontWeight: 700, fontSize: `0.62rem` },
      }),
    );
  if (fl.relance)
    out.push(
      (0, $.jsx)(T, {
        key: `r`,
        label: `Relance due`,
        size: `small`,
        color: `warning`,
        variant: `outlined`,
        sx: { fontWeight: 700, fontSize: `0.62rem` },
      }),
    );
  if (fl.abandon)
    out.push(
      (0, $.jsx)(T, {
        key: `a`,
        label: `Abandon de poste ?`,
        size: `small`,
        color: `error`,
        variant: `filled`,
        sx: { fontWeight: 700, fontSize: `0.62rem` },
      }),
    );
  if (out.length === 0)
    out.push(
      (0, $.jsx)(T, {
        key: `ok`,
        label: `À jour`,
        size: `small`,
        color: `success`,
        variant: `outlined`,
        sx: { fontWeight: 700, fontSize: `0.62rem` },
      }),
    );
  return (0, $.jsx)(a, {
    sx: { display: `flex`, gap: 0.5, flexWrap: `wrap` },
    children: out,
  });
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
    setCout = stCout[1],
    stChP = (0, Q.useState)(1),
    chOpen = stChP[0],
    setCh = stChP[1],
    stLet = (0, Q.useState)(!1),
    dlgLettre = stLet[0],
    setDlgLettre = stLet[1],
    stLetT = (0, Q.useState)(`avertissement`),
    lettreType = stLetT[0],
    setLettreType = stLetT[1],
    stLetD = (0, Q.useState)(null),
    lettreDet = stLetD[0],
    setLettreDet = stLetD[1],
    stAN = (0, Q.useState)(``),
    atNum = stAN[0],
    setAtNum = stAN[1],
    stAD = (0, Q.useState)(``),
    atDecl = stAD[0],
    setAtDecl = stAD[1],
    stAR = (0, Q.useState)(`en_cours`),
    atReco = stAR[0],
    setAtReco = stAR[1],
    stIjV = (0, Q.useState)(``),
    ijVal = stIjV[0],
    setIjVal = stIjV[1],
    stPaiS = (0, Q.useState)(`a_payer`),
    paiSt = stPaiS[0],
    setPaiSt = stPaiS[1],
    stCN = (0, Q.useState)(``),
    certNum = stCN[0],
    setCertNum = stCN[1],
    stCE = (0, Q.useState)(``),
    certEmis = stCE[0],
    setCertEmis = stCE[1],
    stAHN = (0, Q.useState)(``),
    atHN = stAHN[0],
    setAtHN = stAHN[1],
    stPlN = (0, Q.useState)(130),
    plafNew = stPlN[0],
    setPlafNew = stPlN[1];
  var roleAct = window.__congesD2Role || `drh`,
    estEmploye = roleAct === `employe`,
    metaCg = sldStoreMeta(),
    empSim = (metaCg && metaCg.emploiSimule) || `emp-002`,
    FER = sldFset();
  var prm = (0, Q.useMemo)(() => absParam(absStore()), [tick]),
    plafondM = prm.plafondMaladie;
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
      if (r.statut === `non_justifiee`)
        cumulNJ[r.employee_id] = (cumulNJ[r.employee_id] || 0) + r.ouvr;
    });
    base.forEach((r) => {
      r.fl = absFlags(r, cumulNJ[r.employee_id] || 0);
    });
    base.forEach((r) => {
      r.paie = absPaieInfo(r);
      r.certBad = absCertBad(r);
    });
    var plfMemo = {};
    base.forEach((r) => {
      if (ABS_SANT[r.type_absence] && r.statut !== `rejetee`)
        plfMemo[r.employee_id + `|` + r.annee] =
          (plfMemo[r.employee_id + `|` + r.annee] || 0) + r.ouvr;
    });
    base.forEach((r) => {
      if (!ABS_SANT[r.type_absence]) {
        r.plf = null;
        return;
      }
      var cu = plfMemo[r.employee_id + `|` + r.annee] || 0;
      r.plf = absPlafInfo(cu, plafondM);
    });
    return base;
  }, [tick, plafondM]);
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
        if (!(
          r.fl.cnpsLate ||
          r.fl.cnps ||
          r.fl.visite ||
          r.fl.relance ||
          r.fl.abandon ||
          r.statut === `en_attente`
        ))
          return !1;
      } else if (statutF === `paie_restes`) {
        if (!(r.paie && r.paie.statut === `a_recuperer` && r.paie.reste > 0))
          return !1;
      } else if (statutF === `plafond`) {
        if (!(r.plf && r.plf.etat !== `ok`)) return !1;
      } else if (statutF === `cert_bad`) {
        if (!r.certBad) return !1;
      } else if (statutF === `recommande`) {
        var bb = brad[r.employee_id];
        if (!bb || bb.B < 450) return !1;
      } else if (statutF !== `tous` && r.statut !== statutF) return !1;
      if (rech) {
        var q2 = rech.toLowerCase(),
          nm = r.emp ? B(r.emp).toLowerCase() : ``;
        if (
          !nm.includes(q2) &&
          !String(r.motif || ``)
            .toLowerCase()
            .includes(q2) &&
          !String(absLibelle(r.type_absence)).toLowerCase().includes(q2) &&
          !String((r.emp && r.emp.matricule) || ``)
            .toLowerCase()
            .includes(q2) &&
          !String((r.emp && r.emp.departement) || ``)
            .toLowerCase()
            .includes(q2) &&
          !String(r.employee_id || ``)
            .toLowerCase()
            .includes(q2)
        )
          return !1;
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
    var scope = ALL.filter((r) =>
      estEmploye ? r.employee_id === empSim : !0,
    ).filter((r) => exo === `tous` || r.annee === exo);
    scope.forEach((r) => {
      if (r.statut !== `rejetee`) jours += r.ouvr;
      coutTot += r.indem + r.coutR;
      if (
        r.fl.cnpsLate ||
        r.fl.cnps ||
        r.fl.visite ||
        r.fl.relance ||
        r.fl.abandon ||
        r.statut === `en_attente`
      )
        aReg++;
    });
    Object.keys(brad).forEach((k2) => {
      if (brad[k2].B >= 450) bradf++;
    });
    var jOuvrPeriode = sldOuvrables(
        AN + `-01-01`,
        new Date().toISOString().slice(0, 10),
        FER,
      ),
      eff = estEmploye ? 1 : H.length,
      tauxAbs =
        exo === String(AN) && jOuvrPeriode > 0
          ? Math.round((jours / (eff * jOuvrPeriode)) * 100 * 10) / 10
          : null;
    var restes = 0;
    scope.forEach((r) => {
      if (r.statut === `rejetee`) return;
      if (r.paie && r.paie.statut === `a_recuperer` && r.paie.reste > 0)
        restes += r.paie.reste;
    });
    return {
      jours: jours,
      coutTot: coutTot,
      aReg: aReg,
      bradf: bradf,
      tauxAbs: tauxAbs,
      restes: restes,
    };
  }, [ALL, exo, brad, estEmploye, empSim, tick]);
  var alCNPS = rows.filter((r) => r.fl.cnpsLate || r.fl.cnps),
    alAbandon = rows.filter((r) => r.fl.abandon),
    alVisite = rows.filter((r) => r.fl.visite),
    alRelance = rows.filter((r) => r.fl.relance),
    alBrad = rows.filter((r) => {
      var bb = brad[r.employee_id];
      return (
        bb &&
        bb.B >= 450 &&
        r === rows.find((x2) => x2.employee_id === r.employee_id)
      );
    }),
    alMat = rows.filter(
      (r) => r.type_absence === `conge_maternite` && r.statut === `justifiee`,
    ),
    alPlaf = rows
      .filter((r) => r.plf && r.plf.etat !== `ok`)
      .filter(
        (r, ix, arr) =>
          arr.findIndex(
            (x2) => x2.employee_id === r.employee_id && x2.annee === r.annee,
          ) === ix,
      ),
    alCert = rows.filter((r) => r.certBad);
  var depts = (0, Q.useMemo)(() => {
    var s2 = new Set();
    H.forEach((e2) => e2.departement && s2.add(e2.departement));
    return Array.from(s2).sort();
  }, []);
  var fRefresh = () => {
    ((SLD_FSET = null),
      setSync(new Date()),
      setTick(tick + 1),
      setSnack({
        msg: `Dossiers recalculés — sources : base + Congés Annuels V2 + déclarations locales`,
        sev: `success`,
      }));
  };
  var fTri = (key) =>
    setTri((tr) => ({
      key: key,
      dir: tr.key === key && tr.dir === `asc` ? `desc` : `asc`,
    }));
  var fTh = (label, key, align) =>
    (0, $.jsx)(
      v,
      {
        align: align || `left`,
        sx: {
          fontWeight: 700,
          whiteSpace: `nowrap`,
          bgcolor: `background.default`,
        },
        children: (0, $.jsxs)(a, {
          sx: {
            display: `inline-flex`,
            alignItems: `center`,
            gap: 0.5,
            cursor: `pointer`,
            userSelect: `none`,
            "&:hover": { color: `primary.main` },
          },
          onClick: () => fTri(key),
          children: [
            label,
            tri.key === key
              ? (0, $.jsx)(tri.dir === `asc` ? AU : AD, {
                  sx: { fontSize: 15, color: `primary.main` },
                })
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
  var fCnps = (r) =>
    fPatch(
      r.id,
      { cnps_declare: 1, cnps_date: new Date().toISOString().slice(0, 10) },
      `Accident du travail déclaré à la CNPS — délai légal de 48 h couvert (loi n° 98/004).`,
    );
  var fVisite = (r) => {
    if (!vDate)
      return setSnack({
        msg: `Choisissez d'abord la date de la visite de reprise.`,
        sev: `warning`,
      });
    var id = r.id;
    fPatch(
      id,
      { visite_prog: 1, visite_date: vDate },
      `Visite de reprise programmée le ` + A(vDate) + ` (médecine du travail).`,
    );
    setVDate(``);
    setDetail(null);
  };
  var fJustifie = (r) =>
    fPatch(
      r.id,
      {
        statut: `justifiee`,
        justifie_le: new Date().toISOString().slice(0, 10),
      },
      `Justificatif enregistré — dossier marqué justifié.`,
    );
  var fRelance = (r) =>
    fPatch(
      r.id,
      {
        relances: (r.relances || 0) + 1,
        relance_date: new Date().toISOString().slice(0, 10),
      },
      `Relance justificatif enregistrée (rappel au salarié).`,
    );
  var fRejete = (r) =>
    fPatch(
      r.id,
      { statut: `rejetee` },
      `Dossier rejeté — l'absence reste non justifiée.`,
    );
  var fNew = () => {
    if (!empNew || !d1New || !d2New)
      return setSnack({
        msg: `Employé, dates de début et de fin obligatoires.`,
        sev: `warning`,
      });
    if (d2New < d1New)
      return setSnack({
        msg: `La date de fin précède la date de début.`,
        sev: `error`,
      });
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
      at_heure: typeNew === `accident_travail` ? atHN || `00:00` : ``,
    });
    absSave(st);
    ((setDlgNew(!1),
    setD1New(``),
    setD2New(``),
    setMotifNew(``),
    setTick(tick + 1)),
      setSnack({
        msg:
          `Absence déclarée — dossier en attente de justificatif (` +
          sldOuvrables(d1New, d2New, FER) +
          ` j ouvrables).`,
        sev: `success`,
      }));
  };
  var fSaveParams = () => {
    var st = absStore();
    st.meta = st.meta || {};
    st.meta.coutJour = Math.max(0, parseInt(cout, 10) || 0);
    st.meta.plafondMaladie = Math.max(30, parseInt(plafNew, 10) || 130);
    absSave(st);
    ((setDlgPar(!1), setTick(tick + 1)),
      setSnack({
        msg: `Paramètres enregistrés — coûts et plafond art. 86 recalculés.`,
        sev: `success`,
      }));
  };
  var fExport = () => {
    var entetes = [
        `Matricule`,
        `Employé`,
        `Département`,
        `Type`,
        `Du`,
        `Au`,
        `Durée ouvrable (j)`,
        `Durée calendaire (j)`,
        `Statut`,
        `Justificatif reçu le`,
        `CNPS déclarée`,
        `Visite de reprise`,
        `Relances`,
        `Indemnité estimée (FCFA)`,
        `Coût remplacement (FCFA)`,
        `Conformité`,
        `Exercice`,
        `Source`,
        `Certificat émis le`,
        `N° déclaration AT`,
        `Délai CNPS (h)`,
        `Statut paie`,
        `IJ reçues (FCFA)`,
        `Reste à récupérer (FCFA)`,
      ],
      lignes = srt.map((r) => {
        var conf = r.fl.cnpsLate
          ? `CNPS 48 h dépassé`
          : r.fl.cnps
            ? `CNPS à déclarer`
            : r.fl.abandon
              ? `Abandon de poste (art. 34-36)`
              : r.fl.visite
                ? `Visite de reprise due`
                : r.fl.relance
                  ? `Relance justificatif due`
                  : `À jour`;
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
          r.visite_prog
            ? r.visite_date
              ? A(r.visite_date)
              : `programmée`
            : `non`,
          r.relances || 0,
          r.indem,
          r.coutR,
          conf,
          r.annee,
          ABS_SRC[r.source] ? ABS_SRC[r.source][0] : r.source,
          r.cert_emis ? A(r.cert_emis) : ``,
          r.at_num || ``,
          (() => {
            var dl = absDelaiH(r);
            return dl == null ? `` : dl;
          })(),
          r.paie
            ? ABS_PAIE[r.paie.statut]
              ? ABS_PAIE[r.paie.statut][0]
              : r.paie.statut
            : ``,
          r.paie ? r.paie.ijRecues : 0,
          r.paie && r.paie.reste > 0 ? r.paie.reste : 0,
        ]
          .map((x2) => `"${String(x2 == null ? `` : x2).replace(/"/g, `""`)}"`)
          .join(`;`);
      }),
      csv =
        `﻿` +
        entetes.join(`;`) +
        `
` +
        lignes.join(`
`),
      bl = new Blob([csv], { type: `text/csv;charset=utf-8;` }),
      ur = URL.createObjectURL(bl),
      an2 = document.createElement(`a`);
    ((an2.href = ur),
      (an2.download = `absences_${exo}_${new Date().toISOString().slice(0, 10)}.csv`),
      an2.click(),
      URL.revokeObjectURL(ur));
    setSnack({
      msg:
        srt.length +
        ` dossier(s) exporté(s) — valeurs réelles (durées ouvrables, indemnités, conformité)`,
      sev: `success`,
    });
  };
  var openDet = (r2) => {
    if (r2 && r2.fl === undefined) {
      try {
        console.error(
          "AB2DBG detail sans fl:",
          JSON.stringify(r2).slice(0, 400),
        );
      } catch (err) {}
    }
    var at2 = r2 ? absAtInfo(r2) : { num: ``, decl: ``, reco: `en_cours` };
    var pa2 = r2 && r2.paie ? r2.paie : null;
    (setVDate(``),
      setAtNum(at2.num),
      setAtDecl(at2.decl),
      setAtReco(at2.reco || `en_cours`),
      setIjVal(pa2 ? String(pa2.ijRecues || ``) : ``),
      setPaiSt(pa2 ? pa2.statut : `a_payer`),
      setCertNum((r2 && r2.cert_num) || ``),
      setCertEmis((r2 && r2.cert_emis) || ``),
      setDetail(r2));
  };
  var fCertSave = () => {
    if (!detail) return;
    var bad = certEmis
      ? absCertBad({
          cert_emis: certEmis,
          date_debut: detail.date_debut,
          date_fin: detail.date_fin,
        })
      : ``;
    fPatch(
      detail.id,
      {
        cert_num: certNum,
        cert_emis: certEmis,
        statut: `justifiee`,
        justifie_le: new Date().toISOString().slice(0, 10),
      },
      `Certificat enregistré — dossier justifié` +
        (bad
          ? ` (⚠ ` +
            (bad === `antidate`
              ? `émission postérieure à la fin d'arrêt`
              : `émission tardive`) +
            ` — vérifier)`
          : `.`),
    );
    setDetail(null);
  };
  var fAtSave = () => {
    if (!detail) return;
    fPatch(
      detail.id,
      {
        at_num: atNum,
        at_decl: atDecl,
        at_reco: atReco,
        cnps_declare: detail.cnps_declare || (atDecl ? 1 : 0),
        cnps_date: detail.cnps_date || (atDecl ? atDecl.slice(0, 10) : ``),
      },
      `Dossier CNPS AT/MP enregistré — délai 48 h contrôlé en heures.`,
    );
  };
  var fPaieSave = () => {
    if (!detail) return;
    fPatch(
      detail.id,
      { paye_statut: paiSt, ij_recues: parseFloat(ijVal) || 0 },
      `Rapprochement paie enregistré — reste à récupérer recalculé.`,
    );
  };
  var fRechute = () => {
    if (!detail) return;
    var at2 = absAtInfo(detail);
    at2.rechutes.push({ date: new Date().toISOString().slice(0, 10) });
    fPatch(
      detail.id,
      { at_rechutes: at2.rechutes },
      `Rechute déclarée — nouvelle déclaration CNPS requise sous 48 h.`,
    );
  };
  var fLettreOpen = (r2) => {
    var cu = 0;
    ALL.forEach((rr) => {
      if (rr.employee_id === r2.employee_id && rr.statut === `non_justifiee`)
        cu += rr.ouvr;
    });
    (setLettreDet(Object.assign({}, r2, { cumulNJ: cu })),
      setLettreType(
        r2.type_absence === `accident_travail`
          ? `declaration_at`
          : `avertissement`,
      ),
      setDlgLettre(!0));
  };
  var fRegistreAt = () => {
    var ligs = ALL.filter(
      (r2) =>
        r2.type_absence === `accident_travail` &&
        (exo === `tous` || r2.annee === exo),
    );
    if (ligs.length === 0)
      return setSnack({
        msg: `Aucun dossier AT sur l'exercice ` + exo + `.`,
        sev: `warning`,
      });
    var ent = [
      `Matricule`,
      `Employé`,
      `Département`,
      `Date accident`,
      `Heure`,
      `Du`,
      `Au`,
      `J ouvr.`,
      `Déclaration CNPS`,
      `Délai (h)`,
      `N° déclaration`,
      `Reconnaissance`,
      `Rechutes`,
    ];
    var lns = ligs.map((r2) => {
      var at2 = absAtInfo(r2);
      var del = absDelaiH(r2);
      return [
        (r2.emp && r2.emp.matricule) || ``,
        r2.emp ? B(r2.emp) : ``,
        (r2.emp && r2.emp.departement) || ``,
        A(at2.date),
        at2.heure,
        A(r2.date_debut),
        A(r2.date_fin),
        r2.ouvr,
        r2.cnps_declare ? A(r2.cnps_date || ``) : `non`,
        del == null ? `` : del,
        at2.num,
        ABS_RECO[at2.reco] ? ABS_RECO[at2.reco][0] : at2.reco || ``,
        at2.rechutes.length,
      ]
        .map((x2) => `"${String(x2 == null ? `` : x2).replace(/"/g, `""`)}"`)
        .join(`;`);
    });
    var csv =
      `﻿` +
      ent.join(`;`) +
      `
` +
      lns.join(`
`);
    var bl = new Blob([csv], { type: `text/csv;charset=utf-8;` });
    var ur = URL.createObjectURL(bl);
    var an2 = document.createElement(`a`);
    ((an2.href = ur),
      (an2.download = `registre_at_${exo}_${new Date().toISOString().slice(0, 10)}.csv`),
      an2.click(),
      URL.revokeObjectURL(ur));
    setSnack({
      msg: `Registre AT ` + exo + ` exporté — ` + ligs.length + ` dossier(s).`,
      sev: `success`,
    });
  };
  var absDlgDetail = () =>
    (0, $.jsxs)(f, {
      open: !!detail,
      onClose: () => setDetail(null),
      maxWidth: `md`,
      fullWidth: !0,
      children: [
        detail
          ? (0, $.jsxs)(h, {
              sx: {
                fontWeight: 800,
                display: `flex`,
                alignItems: `center`,
                gap: 1.5,
              },
              children: [
                sldAvatar(detail.emp || {}, 44, 18),
                (0, $.jsxs)(a, {
                  children: [
                    (0, $.jsx)(i, {
                      variant: `h6`,
                      fontWeight: 800,
                      children: detail.emp ? B(detail.emp) : detail.employee_id,
                    }),
                    (0, $.jsx)(i, {
                      variant: `caption`,
                      color: `text.secondary`,
                      children:
                        ((detail.emp && detail.emp.poste) || ``) +
                        ` · ` +
                        ((detail.emp && detail.emp.departement) || ``) +
                        ` · ` +
                        ((detail.emp && detail.emp.matricule) || ``),
                    }),
                  ],
                }),
                (0, $.jsx)(a, {
                  sx: {
                    ml: `auto`,
                    display: `flex`,
                    gap: 1,
                    alignItems: `center`,
                  },
                  children: [
                    absChipSource(detail.source),
                    absChipStatut(detail.statut),
                  ],
                }),
              ],
            })
          : null,
        detail
          ? (0, $.jsxs)(p, {
              children: [
                detail.fl.cnpsLate
                  ? (0, $.jsx)(c, {
                      severity: `error`,
                      sx: { mb: 2, fontWeight: 600 },
                      children: `Délai CNPS de 48 h dépassé sans déclaration (loi n° 98/004) — déclarez immédiatement pour sécuriser la prise en charge.`,
                    })
                  : null,
                detail.fl.abandon
                  ? (0, $.jsx)(c, {
                      severity: `error`,
                      sx: { mb: 2, fontWeight: 600 },
                      children: `Cumul ≥ 8 jours ouvrables non justifiés — procédure disciplinaire / abandon de poste (art. 34-36 CT) à engager.`,
                    })
                  : null,
                detail.fl.visite
                  ? (0, $.jsx)(c, {
                      severity: `warning`,
                      sx: { mb: 2, fontWeight: 600 },
                      children: `Arrêt de plus de 3 jours : visite de reprise à programmer avec la médecine du travail.`,
                    })
                  : null,
                detail.fl.relance
                  ? (0, $.jsx)(c, {
                      severity: `warning`,
                      sx: { mb: 2, fontWeight: 600 },
                      children: `Aucun justificatif reçu — relancez le salarié (J+2) et tracez la démarche.`,
                    })
                  : null,
                (0, $.jsxs)(a, {
                  sx: {
                    display: `grid`,
                    gridTemplateColumns: {
                      xs: `repeat(3,1fr)`,
                      sm: `repeat(6,1fr)`,
                    },
                    gap: 1.5,
                  },
                  children: [
                    (0, $.jsx)(AbsTuile, {
                      label: `Type`,
                      valeur: absLibelle(detail.type_absence),
                    }),
                    (0, $.jsx)(AbsTuile, {
                      label: `Durée ouvrable`,
                      valeur: detail.ouvr + ` j`,
                    }),
                    (0, $.jsx)(AbsTuile, {
                      label: `Durée calendaire`,
                      valeur: detail.cal + ` j`,
                    }),
                    (0, $.jsx)(AbsTuile, {
                      label: `Taux légal`,
                      valeur: detail.tm[1] + ` %`,
                    }),
                    (0, $.jsx)(AbsTuile, {
                      label: `Indemnité estimée`,
                      valeur: sldFCFA(detail.indem),
                      couleur:
                        detail.indem > 0 ? `success.main` : `text.primary`,
                    }),
                    (0, $.jsx)(AbsTuile, {
                      label: `Coût remplacement`,
                      valeur: detail.coutR > 0 ? sldFCFA(detail.coutR) : `—`,
                      couleur: detail.coutR > 0 ? `error.main` : `text.primary`,
                    }),
                  ],
                }),
                (0, $.jsx)(i, {
                  variant: `caption`,
                  sx: { display: `block`, mt: 1, color: `text.secondary` },
                  children:
                    (detail.tm[2] || ``) +
                    (detail.emp && detail.emp.salaire_brut
                      ? ` · base : salaire brut / 26 × jours ouvrables × taux`
                      : ``),
                }),
                (0, $.jsx)(i, {
                  variant: `subtitle2`,
                  sx: { mt: 2, mb: 1, fontWeight: 800 },
                  children: `Conformité & actions`,
                }),
                (0, $.jsxs)(o, {
                  direction: `row`,
                  spacing: 1,
                  sx: { flexWrap: `wrap`, rowGap: 1.5, alignItems: `center` },
                  children: [
                    detail.type_absence === `accident_travail`
                      ? detail.cnps_declare
                        ? (0, $.jsx)(T, {
                            label:
                              `CNPS déclarée` +
                              (detail.cnps_date
                                ? ` le ` + A(detail.cnps_date)
                                : ``),
                            color: `success`,
                            variant: `outlined`,
                            sx: { fontWeight: 700 },
                          })
                        : (0, $.jsx)(l, {
                            variant: `contained`,
                            color: `error`,
                            size: `small`,
                            startIcon: (0, $.jsx)(GVL, {}),
                            onClick: () => fCnps(detail),
                            sx: { textTransform: `none`, fontSize: `0.75rem` },
                            children: `Déclarer à la CNPS`,
                          })
                      : null,
                    detail.ouvr > 3
                      ? detail.visite_prog
                        ? (0, $.jsx)(T, {
                            label:
                              `Visite de reprise` +
                              (detail.visite_date
                                ? ` — ` + A(detail.visite_date)
                                : ` programmée`),
                            color: `success`,
                            variant: `outlined`,
                            sx: { fontWeight: 700 },
                          })
                        : (0, $.jsxs)(a, {
                            sx: {
                              display: `flex`,
                              gap: 1,
                              alignItems: `center`,
                              flexWrap: `wrap`,
                            },
                            children: [
                              (0, $.jsx)(D, {
                                type: `date`,
                                size: `small`,
                                label: `Date visite`,
                                value: vDate,
                                onChange: (e2) => setVDate(e2.target.value),
                                InputLabelProps: { shrink: !0 },
                                sx: {
                                  width: 175,
                                  "& .MuiInput-root": { fontSize: `0.8rem` },
                                },
                              }),
                              (0, $.jsx)(l, {
                                variant: `contained`,
                                size: `small`,
                                startIcon: (0, $.jsx)(SCH, {}),
                                onClick: () => fVisite(detail),
                                sx: {
                                  textTransform: `none`,
                                  fontSize: `0.75rem`,
                                  bgcolor: `#7e3ff2`,
                                },
                                children: `Programmer`,
                              }),
                            ],
                          })
                      : null,
                    detail.statut === `en_attente` ||
                    detail.statut === `non_justifiee`
                      ? (0, $.jsxs)(o, {
                          direction: `row`,
                          spacing: 1,
                          children: [
                            (0, $.jsx)(l, {
                              variant: `contained`,
                              size: `small`,
                              startIcon: (0, $.jsx)(RCPT, {}),
                              onClick: () => {
                                (fJustifie(detail), setDetail(null));
                              },
                              sx: {
                                textTransform: `none`,
                                fontSize: `0.75rem`,
                              },
                              children: `Certificat reçu — justifier`,
                            }),
                            (0, $.jsx)(l, {
                              variant: `outlined`,
                              size: `small`,
                              startIcon: (0, $.jsx)(RF, {}),
                              onClick: () => fRelance(detail),
                              sx: {
                                textTransform: `none`,
                                fontSize: `0.75rem`,
                              },
                              children:
                                `Relancer (` + (detail.relances || 0) + `)`,
                            }),
                            detail.statut === `en_attente`
                              ? (0, $.jsx)(l, {
                                  variant: `outlined`,
                                  color: `error`,
                                  size: `small`,
                                  onClick: () => {
                                    (fRejete(detail), setDetail(null));
                                  },
                                  sx: {
                                    textTransform: `none`,
                                    fontSize: `0.75rem`,
                                  },
                                  children: `Rejeter`,
                                })
                              : null,
                          ],
                        })
                      : null,
                  ],
                }),
                (0, $.jsx)(i, {
                  variant: `subtitle2`,
                  sx: { mt: 2.5, mb: 1, fontWeight: 800 },
                  children: `Plafond maladie — art. 86 CT (6 mois / an)`,
                }),
                detail.plf
                  ? (0, $.jsxs)(a, {
                      sx: { mb: 1 },
                      children: [
                        (0, $.jsxs)(a, {
                          sx: {
                            display: `flex`,
                            alignItems: `center`,
                            gap: 1,
                            mb: 0.5,
                          },
                          children: [
                            (0, $.jsx)(a, {
                              sx: {
                                flex: 1,
                                height: 10,
                                borderRadius: 5,
                                bgcolor: `action.hover`,
                                overflow: `hidden`,
                              },
                              children: (0, $.jsx)(a, {
                                sx: {
                                  width: detail.plf.pct + `%`,
                                  height: `100%`,
                                  bgcolor:
                                    detail.plf.etat === `fin`
                                      ? `error.main`
                                      : detail.plf.etat === `proche`
                                        ? `warning.main`
                                        : `success.main`,
                                },
                              }),
                            }),
                            (0, $.jsx)(i, {
                              variant: `caption`,
                              fontWeight: 800,
                              children:
                                detail.plf.pris +
                                ` / ` +
                                detail.plf.plafond +
                                ` j ouvrables (` +
                                detail.plf.pct +
                                ` %)`,
                            }),
                          ],
                        }),
                        detail.plf.etat === `fin`
                          ? (0, $.jsx)(i, {
                              variant: `caption`,
                              sx: { color: `error.main`, fontWeight: 700 },
                              children: `Plafond annuel atteint — toute prolongation est sans rémunération (art. 86 CT) ; prévoir la sortie ou le reclassement.`,
                            })
                          : detail.plf.etat === `proche`
                            ? (0, $.jsx)(i, {
                                variant: `caption`,
                                sx: { color: `warning.main`, fontWeight: 700 },
                                children: `≥ 80 % du plafond annuel consommé — anticiper la fin de droits (art. 86 CT).`,
                              })
                            : null,
                      ],
                    })
                  : null,
                detail.type_absence === `accident_travail`
                  ? (0, $.jsxs)(a, {
                      sx: { mt: 2 },
                      children: [
                        (0, $.jsx)(i, {
                          variant: `subtitle2`,
                          sx: { mb: 1, fontWeight: 800 },
                          children: `Dossier CNPS AT/MP — loi n° 98/004`,
                        }),
                        (0, $.jsxs)(a, {
                          sx: {
                            display: `flex`,
                            gap: 1.5,
                            flexWrap: `wrap`,
                            alignItems: `center`,
                          },
                          children: [
                            (0, $.jsx)(D, {
                              size: `small`,
                              label: `N° déclaration CNPS`,
                              value: atNum,
                              onChange: (e2) => setAtNum(e2.target.value),
                              sx: {
                                width: 200,
                                "& .MuiInput-root": { fontSize: `0.8rem` },
                              },
                            }),
                            (0, $.jsx)(D, {
                              type: `datetime-local`,
                              size: `small`,
                              label: `Déclaration CNPS le`,
                              value: atDecl,
                              onChange: (e2) => setAtDecl(e2.target.value),
                              InputLabelProps: { shrink: !0 },
                              sx: {
                                "& .MuiInput-root": { fontSize: `0.8rem` },
                              },
                            }),
                            (0, $.jsxs)(D, {
                              select: !0,
                              size: `small`,
                              label: `Reconnaissance`,
                              value: atReco,
                              onChange: (e2) => setAtReco(e2.target.value),
                              sx: {
                                minWidth: 190,
                                "& .MuiInput-root": { fontSize: `0.8rem` },
                              },
                              children: Object.keys(ABS_RECO).map((rk) =>
                                (0, $.jsx)(
                                  s,
                                  { value: rk, children: ABS_RECO[rk][0] },
                                  rk,
                                ),
                              ),
                            }),
                            (0, $.jsx)(l, {
                              variant: `contained`,
                              size: `small`,
                              onClick: fAtSave,
                              sx: {
                                textTransform: `none`,
                                fontSize: `0.75rem`,
                                bgcolor: `#7e3ff2`,
                              },
                              children: `Enregistrer`,
                            }),
                            (0, $.jsx)(l, {
                              variant: `outlined`,
                              size: `small`,
                              onClick: fRechute,
                              sx: {
                                textTransform: `none`,
                                fontSize: `0.75rem`,
                              },
                              children: `Déclarer une rechute`,
                            }),
                            (0, $.jsx)(l, {
                              variant: `outlined`,
                              size: `small`,
                              onClick: fRegistreAt,
                              sx: {
                                textTransform: `none`,
                                fontSize: `0.75rem`,
                              },
                              children: `Registre AT ` + (detail.annee || AN),
                            }),
                          ],
                        }),
                        (() => {
                          var del = absDelaiH(detail);
                          return del != null
                            ? (0, $.jsx)(i, {
                                variant: `caption`,
                                sx: {
                                  display: `block`,
                                  mt: 0.5,
                                  fontWeight: 700,
                                  color:
                                    del <= 48 ? `success.main` : `error.main`,
                                },
                                children:
                                  `Délai de déclaration : ` +
                                  del +
                                  ` h — ` +
                                  (del <= 48
                                    ? `conforme (≤ 48 h)`
                                    : `hors délai légal de 48 h (loi n° 98/004)`),
                              })
                            : (0, $.jsx)(i, {
                                variant: `caption`,
                                sx: {
                                  display: `block`,
                                  mt: 0.5,
                                  color: `text.secondary`,
                                },
                                children: `Renseignez la date/heure de déclaration pour contrôler le délai légal de 48 h.`,
                              });
                        })(),
                        (detail.at_rechutes || []).length > 0
                          ? (0, $.jsx)(i, {
                              variant: `caption`,
                              sx: {
                                display: `block`,
                                color: `warning.main`,
                                fontWeight: 700,
                              },
                              children:
                                (detail.at_rechutes || []).length +
                                ` rechute(s) enregistrée(s) — chaque rechute exige une nouvelle déclaration CNPS sous 48 h.`,
                            })
                          : null,
                      ],
                    })
                  : null,
                detail.indem > 0 ||
                detail.type_absence === `accident_travail` ||
                detail.type_absence === `conge_maternite`
                  ? (0, $.jsxs)(a, {
                      sx: { mt: 2 },
                      children: [
                        (0, $.jsx)(i, {
                          variant: `subtitle2`,
                          sx: { mb: 1, fontWeight: 800 },
                          children: `Rapprochement paie & IJ CNPS`,
                        }),
                        (0, $.jsxs)(a, {
                          sx: {
                            display: `grid`,
                            gridTemplateColumns: {
                              xs: `1fr`,
                              sm: `repeat(4,1fr)`,
                            },
                            gap: 1.5,
                          },
                          children: [
                            (0, $.jsx)(AbsTuile, {
                              label: `Avance employeur`,
                              valeur: sldFCFA(detail.indem || 0),
                            }),
                            (0, $.jsx)(AbsTuile, {
                              label: `IJ CNPS attendues`,
                              valeur:
                                detail.paie && detail.paie.ijAttendue > 0
                                  ? sldFCFA(detail.paie.ijAttendue)
                                  : `—`,
                            }),
                            (0, $.jsx)(AbsTuile, {
                              label: `IJ déjà reçues`,
                              valeur: sldFCFA(
                                (detail.paie && detail.paie.ijRecues) || 0,
                              ),
                            }),
                            (0, $.jsx)(AbsTuile, {
                              label: `Reste à récupérer`,
                              valeur:
                                detail.paie && detail.paie.reste > 0
                                  ? sldFCFA(detail.paie.reste)
                                  : `—`,
                              couleur:
                                detail.paie && detail.paie.reste > 0
                                  ? `error.main`
                                  : `success.main`,
                            }),
                          ],
                        }),
                        (0, $.jsxs)(a, {
                          sx: {
                            display: `flex`,
                            gap: 1.5,
                            flexWrap: `wrap`,
                            alignItems: `center`,
                            mt: 1,
                          },
                          children: [
                            (0, $.jsxs)(D, {
                              select: !0,
                              size: `small`,
                              label: `Statut paie`,
                              value: paiSt,
                              onChange: (e2) => setPaiSt(e2.target.value),
                              sx: {
                                minWidth: 210,
                                "& .MuiInput-root": { fontSize: `0.8rem` },
                              },
                              children: Object.keys(ABS_PAIE).map((pk) =>
                                (0, $.jsx)(
                                  s,
                                  { value: pk, children: ABS_PAIE[pk][0] },
                                  pk,
                                ),
                              ),
                            }),
                            (0, $.jsx)(D, {
                              type: `number`,
                              size: `small`,
                              label: `IJ CNPS reçues (FCFA)`,
                              value: ijVal,
                              onChange: (e2) => setIjVal(e2.target.value),
                              sx: {
                                width: 190,
                                "& .MuiInput-root": { fontSize: `0.8rem` },
                              },
                            }),
                            (0, $.jsx)(l, {
                              variant: `contained`,
                              size: `small`,
                              onClick: fPaieSave,
                              sx: {
                                textTransform: `none`,
                                fontSize: `0.75rem`,
                                bgcolor: `#7e3ff2`,
                              },
                              children: `Enregistrer`,
                            }),
                          ],
                        }),
                      ],
                    })
                  : null,
                ABS_SANT[detail.type_absence]
                  ? (0, $.jsxs)(a, {
                      sx: { mt: 2 },
                      children: [
                        (0, $.jsx)(i, {
                          variant: `subtitle2`,
                          sx: { mb: 1, fontWeight: 800 },
                          children: `Certificat médical`,
                        }),
                        (0, $.jsxs)(a, {
                          sx: {
                            display: `flex`,
                            gap: 1.5,
                            flexWrap: `wrap`,
                            alignItems: `center`,
                          },
                          children: [
                            (0, $.jsx)(D, {
                              size: `small`,
                              label: `N° du certificat`,
                              value: certNum,
                              onChange: (e2) => setCertNum(e2.target.value),
                              sx: {
                                width: 190,
                                "& .MuiInput-root": { fontSize: `0.8rem` },
                              },
                            }),
                            (0, $.jsx)(D, {
                              type: `date`,
                              size: `small`,
                              label: `Émis le`,
                              value: certEmis,
                              onChange: (e2) => setCertEmis(e2.target.value),
                              InputLabelProps: { shrink: !0 },
                              sx: {
                                width: 175,
                                "& .MuiInput-root": { fontSize: `0.8rem` },
                              },
                            }),
                            (0, $.jsx)(l, {
                              variant: `contained`,
                              size: `small`,
                              startIcon: (0, $.jsx)(RCPT, {}),
                              onClick: fCertSave,
                              sx: {
                                textTransform: `none`,
                                fontSize: `0.75rem`,
                              },
                              children: `Enregistrer & justifier`,
                            }),
                          ],
                        }),
                        detail.certBad
                          ? (0, $.jsx)(c, {
                              severity: `error`,
                              sx: { mt: 1, fontWeight: 600 },
                              children:
                                detail.certBad === `antidate`
                                  ? `Certificat émis après la fin de l'arrêt — possible antidatation : vérifier auprès du praticien avant paiement.`
                                  : `Certificat émis plus de 7 jours après le début de l'arrêt — couverture tardive à faire régulariser.`,
                            })
                          : null,
                      ],
                    })
                  : null,
                (0, $.jsx)(i, {
                  variant: `subtitle2`,
                  sx: { mt: 2.5, mb: 1, fontWeight: 800 },
                  children: `Historique du dossier`,
                }),
                (0, $.jsx)(a, {
                  sx: { display: `flex`, flexDirection: `column`, gap: 0.75 },
                  children: [
                    [
                      `Déclarée — ` +
                        A(detail.date_debut) +
                        ` · motif : ` +
                        (detail.motif || `—`),
                      CT,
                      `primary.main`,
                    ],
                    detail.justifie_le
                      ? [
                          `Justificatif reçu — ` + A(detail.justifie_le),
                          RCPT,
                          `success.main`,
                        ]
                      : null,
                    detail.cnps_declare
                      ? [
                          `Déclarée à la CNPS` +
                            (detail.cnps_date
                              ? ` — ` + A(detail.cnps_date)
                              : ``),
                          GVL,
                          `success.main`,
                        ]
                      : null,
                    detail.cert_emis
                      ? [
                          `Certificat médical` +
                            (detail.cert_num ? ` n° ` + detail.cert_num : ``) +
                            ` — émis le ` +
                            A(detail.cert_emis) +
                            (detail.certBad
                              ? ` ⚠ ` +
                                (detail.certBad === `antidate`
                                  ? `émission postérieure à la fin d'arrêt`
                                  : `émission tardive`)
                              : ``),
                          RCPT,
                          detail.certBad ? `error.main` : `success.main`,
                        ]
                      : null,
                    detail.at_num
                      ? [
                          `Dossier CNPS AT n° ` +
                            detail.at_num +
                            (detail.at_reco && ABS_RECO[detail.at_reco]
                              ? ` — ` + ABS_RECO[detail.at_reco][0]
                              : ``),
                          GVL,
                          `primary.main`,
                        ]
                      : null,
                    (detail.at_rechutes || []).length > 0
                      ? [
                          (detail.at_rechutes || []).length +
                            ` rechute(s) déclarée(s)`,
                          HEA,
                          `warning.main`,
                        ]
                      : null,
                    detail.ij_recues > 0
                      ? [
                          `IJ CNPS/assureur reçues — ` +
                            sldFCFA(detail.ij_recues),
                          PYC,
                          `success.main`,
                        ]
                      : null,
                    detail.relances > 0
                      ? [
                          detail.relances +
                            ` relance(s) — dernière le ` +
                            A(detail.relance_date),
                          RF,
                          `warning.main`,
                        ]
                      : null,
                    [
                      `Fin d'arrêt — ` + A(detail.date_fin),
                      AT,
                      `text.secondary`,
                    ],
                    detail.visite_prog
                      ? [
                          `Visite de reprise` +
                            (detail.visite_date
                              ? ` — ` + A(detail.visite_date)
                              : ` programmée`),
                          SCH,
                          `success.main`,
                        ]
                      : null,
                  ]
                    .filter(Boolean)
                    .map((li, ix) =>
                      (0, $.jsxs)(
                        a,
                        {
                          sx: {
                            display: `flex`,
                            alignItems: `center`,
                            gap: 1.2,
                          },
                          children: [
                            (0, $.jsx)(li[1], {
                              sx: { fontSize: 16, color: li[2] },
                            }),
                            (0, $.jsx)(i, {
                              variant: `body2`,
                              children: li[0],
                            }),
                          ],
                        },
                        ix,
                      ),
                    ),
                }),
              ],
            })
          : null,
        (0, $.jsxs)(m, {
          sx: { px: 3, pb: 2 },
          children: [
            (0, $.jsx)(l, {
              onClick: () => setDetail(null),
              children: `Fermer`,
            }),
            detail && detail.source === `conges`
              ? (0, $.jsx)(l, {
                  variant: `contained`,
                  startIcon: (0, $.jsx)(CT, {}),
                  onClick: () =>
                    nav(`/domaine2_Gestion_Administrative_Personnel/conges`),
                  sx: { bgcolor: `#7e3ff2`, textTransform: `none` },
                  children: `Ouvrir Congés Annuels`,
                })
              : null,
            detail
              ? (0, $.jsx)(l, {
                  variant: `outlined`,
                  onClick: () => {
                    (setRech(detail.emp ? B(detail.emp) : detail.employee_id),
                      setDetail(null),
                      setPage(0));
                  },
                  sx: { textTransform: `none` },
                  children: `Voir tous ses dossiers`,
                })
              : null,
            detail
              ? (0, $.jsx)(l, {
                  variant: `outlined`,
                  size: `small`,
                  startIcon: (0, $.jsx)(HIS, {}),
                  onClick: () => fLettreOpen(detail),
                  sx: { textTransform: `none`, fontSize: `0.75rem` },
                  children: `Modèles de lettres`,
                })
              : null,
          ],
        }),
      ],
    });
  var absDlgNew = () =>
    (0, $.jsxs)(f, {
      open: dlgNew,
      onClose: () => setDlgNew(!1),
      maxWidth: `sm`,
      fullWidth: !0,
      children: [
        (0, $.jsx)(h, {
          sx: { fontWeight: 800 },
          children: `Déclarer une absence`,
        }),
        (0, $.jsxs)(p, {
          sx: { display: `flex`, flexDirection: `column`, gap: 2 },
          children: [
            (0, $.jsx)(c, {
              severity: `info`,
              children: `Le dossier démarre « En attente » — justificatif à fournir sous 48 h. Durées recalculées automatiquement en jours ouvrables (week-ends et fériés Cameroun déduits).`,
            }),
            (0, $.jsxs)(D, {
              select: !0,
              size: `small`,
              label: `Employé`,
              value: empNew,
              onChange: (e2) => setEmpNew(e2.target.value),
              disabled: estEmploye,
              sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
              children: [
                (0, $.jsx)(s, {
                  value: ``,
                  children: `— Choisir un employé —`,
                }),
                H.map((e3) =>
                  (0, $.jsx)(
                    s,
                    {
                      value: e3.id,
                      children: B(e3) + ` · ` + (e3.departement || ``),
                    },
                    e3.id,
                  ),
                ),
              ],
            }),
            (0, $.jsxs)(D, {
              select: !0,
              size: `small`,
              label: `Type d'absence`,
              value: typeNew,
              onChange: (e2) => setTypeNew(e2.target.value),
              sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
              children: Object.keys(ABS_TYPES).map((tk) =>
                (0, $.jsx)(s, { value: tk, children: ABS_TYPES[tk][0] }, tk),
              ),
            }),
            (0, $.jsxs)(a, {
              sx: { display: `grid`, gridTemplateColumns: `1fr 1fr`, gap: 2 },
              children: [
                (0, $.jsx)(D, {
                  type: `date`,
                  size: `small`,
                  label: `Du`,
                  value: d1New,
                  onChange: (e2) => setD1New(e2.target.value),
                  InputLabelProps: { shrink: !0 },
                  sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                }),
                (0, $.jsx)(D, {
                  type: `date`,
                  size: `small`,
                  label: `Au`,
                  value: d2New,
                  onChange: (e2) => setD2New(e2.target.value),
                  InputLabelProps: { shrink: !0 },
                  sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                }),
              ],
            }),
            d1New && d2New && d2New >= d1New
              ? (0, $.jsx)(i, {
                  variant: `caption`,
                  color: `text.secondary`,
                  children:
                    `Durée : ` +
                    sldOuvrables(d1New, d2New, FER) +
                    ` j ouvrables / ` +
                    absCalendaire(d1New, d2New) +
                    ` j calendaires · indemnité estimée ` +
                    sldFCFA(
                      absIndemn(
                        R(empNew),
                        sldOuvrables(d1New, d2New, FER),
                        ABS_TYPES[typeNew][1],
                      ),
                    ),
                })
              : null,
            typeNew === `accident_travail`
              ? (0, $.jsx)(D, {
                  type: `time`,
                  size: `small`,
                  label: `Heure de l'accident (contrôle 48 h)`,
                  value: atHN,
                  onChange: (e2) => setAtHN(e2.target.value),
                  InputLabelProps: { shrink: !0 },
                  sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
                })
              : null,
            (0, $.jsx)(D, {
              size: `small`,
              label: `Motif (facultatif)`,
              value: motifNew,
              onChange: (e2) => setMotifNew(e2.target.value),
              sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
            }),
          ],
        }),
        (0, $.jsxs)(m, {
          sx: { px: 3, pb: 2 },
          children: [
            (0, $.jsx)(l, {
              onClick: () => setDlgNew(!1),
              children: `Annuler`,
            }),
            (0, $.jsx)(l, {
              variant: `contained`,
              onClick: fNew,
              sx: { bgcolor: `#7e3ff2`, textTransform: `none` },
              children: `Enregistrer le dossier`,
            }),
          ],
        }),
      ],
    });
  var absDlgParams = () =>
    (0, $.jsxs)(f, {
      open: dlgPar,
      onClose: () => setDlgPar(!1),
      maxWidth: `xs`,
      fullWidth: !0,
      children: [
        (0, $.jsx)(h, {
          sx: { fontWeight: 800 },
          children: `Paramètres de coûts`,
        }),
        (0, $.jsxs)(p, {
          sx: { display: `flex`, flexDirection: `column`, gap: 2 },
          children: [
            (0, $.jsx)(D, {
              type: `number`,
              size: `small`,
              label: `Coût journalier de remplacement (FCFA)`,
              value: cout,
              onChange: (e2) => setCout(e2.target.value),
              sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
            }),
            (0, $.jsx)(D, {
              type: `number`,
              size: `small`,
              label: `Plafond maladie art. 86 (j ouvrables / an)`,
              value: plafNew,
              onChange: (e2) => setPlafNew(e2.target.value),
              helperText: `Défaut légal ≈ 6 mois (130 j ouvrables) — alerte dès 80 %`,
              sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
            }),
            (0, $.jsx)(i, {
              variant: `caption`,
              color: `text.secondary`,
              children:
                `Appliqué aux seules absences non justifiées (coût de remplacement). Les indemnités légales utilisent salaire brut / 26 × jours ouvrables × taux réglementaire : ` +
                Object.keys(ABS_TYPES)
                  .map((tk) => absLibelle(tk) + ` ` + ABS_TYPES[tk][1] + ` %`)
                  .join(` · `) +
                `.`,
            }),
          ],
        }),
        (0, $.jsxs)(m, {
          sx: { px: 3, pb: 2 },
          children: [
            (0, $.jsx)(l, {
              onClick: () => setDlgPar(!1),
              children: `Annuler`,
            }),
            (0, $.jsx)(l, {
              variant: `contained`,
              onClick: fSaveParams,
              sx: { bgcolor: `#7e3ff2`, textTransform: `none` },
              children: `Enregistrer`,
            }),
          ],
        }),
      ],
    });
  var absDlgLettres = () => {
    var txt = absLettreTexte(lettreType, lettreDet, A);
    var fCopier = () => {
      var ok = () =>
        setSnack({
          msg:
            `Modèle « ` +
            (ABS_LETTRE_MODELES.find((m2) => m2[0] === lettreType) || [
              ``,
              lettreType,
            ])[1] +
            ` » copié — collez-le dans votre courrier ou e-mail.`,
          sev: `success`,
        });
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(txt).then(ok, () => {
            try {
              var ta = document.createElement(`textarea`);
              ta.value = txt;
              document.body.appendChild(ta);
              ta.select();
              document.execCommand(`copy`);
              document.body.removeChild(ta);
              ok();
            } catch (err) {}
          });
          return;
        }
      } catch (err) {}
      try {
        var ta2 = document.createElement(`textarea`);
        ta2.value = txt;
        document.body.appendChild(ta2);
        ta2.select();
        document.execCommand(`copy`);
        document.body.removeChild(ta2);
        ok();
      } catch (err) {}
    };
    return (0, $.jsxs)(f, {
      open: dlgLettre,
      onClose: () => setDlgLettre(!1),
      maxWidth: `md`,
      fullWidth: !0,
      children: [
        (0, $.jsx)(h, {
          sx: { fontWeight: 800 },
          children: `Modèles de lettres — pré-remplis avec les données du dossier`,
        }),
        (0, $.jsxs)(p, {
          sx: { display: `flex`, flexDirection: `column`, gap: 2 },
          children: [
            (0, $.jsxs)(D, {
              select: !0,
              size: `small`,
              label: `Modèle`,
              value: lettreType,
              onChange: (e2) => setLettreType(e2.target.value),
              sx: { "& .MuiInput-root": { fontSize: `0.85rem` } },
              children: ABS_LETTRE_MODELES.map((m2) =>
                (0, $.jsx)(s, { value: m2[0], children: m2[1] }, m2[0]),
              ),
            }),
            (0, $.jsx)(a, {
              sx: {
                bgcolor: `background.default`,
                border: `1px solid`,
                borderColor: `divider`,
                borderRadius: 2,
                p: 2,
                maxHeight: 380,
                overflowY: `auto`,
                whiteSpace: `pre-wrap`,
                fontFamily: `monospace`,
                fontSize: `0.78rem`,
                lineHeight: 1.55,
              },
              children: txt,
            }),
            lettreDet && lettreDet.type_absence === `accident_travail`
              ? (0, $.jsx)(c, {
                  severity: `info`,
                  children: `La déclaration AT reprend les données du dossier (dates, circonstances, délai de déclaration). Complétez le n° CNPS après dépôt.`,
                })
              : null,
          ],
        }),
        (0, $.jsxs)(m, {
          sx: { px: 3, pb: 2 },
          children: [
            (0, $.jsx)(l, {
              onClick: () => setDlgLettre(!1),
              children: `Fermer`,
            }),
            (0, $.jsx)(l, {
              variant: `contained`,
              onClick: fCopier,
              sx: { bgcolor: `#7e3ff2`, textTransform: `none` },
              children: `Copier le modèle`,
            }),
          ],
        }),
      ],
    });
  };
  /* — Vue salarié (RGPD, rôle Employé) : uniquement ses propres dossiers — */
  var jRestants = Math.max(
    0,
    Math.ceil((new Date(AN, 11, 31) - new Date()) / 864e5),
  );
  if (estEmploye) {
    var mes = srt,
      mesJours = mes
        .filter((r) => r.statut !== `rejetee`)
        .reduce((s2, r) => s2 + r.ouvr, 0),
      mesAtt = mes.filter((r) => r.statut === `en_attente`).length,
      mesIndem = mes
        .filter((r) => r.statut !== `rejetee`)
        .reduce((s2, r) => s2 + r.indem, 0),
      moEmp = R(empSim) || {},
      prochain = mes
        .filter((r) => r.date_fin >= new Date().toISOString().slice(0, 10))
        .sort((r1, r2) => (r1.date_fin > r2.date_fin ? 1 : -1))[0];
    return (0, $.jsxs)(a, {
      children: [
        (0, $.jsx)(c, {
          severity: `info`,
          sx: { mb: 2.5, fontWeight: 600 },
          children: `Vue salarié — vous consultez uniquement vos propres dossiers d'absence (confidentialité RGPD).`,
        }),
        (0, $.jsx)(J, {
          title: `Mes absences & arrêts`,
          subtitle: `Historique complet (tous exercices) · décompte en jours ouvrables (fériés Cameroun déduits)`,
          action: (0, $.jsx)(l, {
            variant: `outlined`,
            size: `small`,
            startIcon: (0, $.jsx)(RF, {}),
            onClick: fRefresh,
            sx: { textTransform: `none`, fontSize: `0.75rem` },
            children: `Actualiser`,
          }),
        }),
        (0, $.jsx)(ee, {
          sx: { mt: 2, borderRadius: 3 },
          children: (0, $.jsxs)(u, {
            children: [
              (0, $.jsxs)(o, {
                direction: `row`,
                spacing: 2,
                alignItems: `center`,
                sx: { mb: 2 },
                children: [
                  sldAvatar(moEmp, 56, 22),
                  (0, $.jsxs)(a, {
                    children: [
                      (0, $.jsx)(i, {
                        variant: `h6`,
                        fontWeight: 800,
                        children: B(moEmp),
                      }),
                      (0, $.jsx)(i, {
                        variant: `body2`,
                        color: `text.secondary`,
                        children:
                          (moEmp.poste || ``) +
                          ` · ` +
                          (moEmp.departement || ``) +
                          ` · ` +
                          (moEmp.matricule || ``),
                      }),
                    ],
                  }),
                  (0, $.jsx)(a, {
                    sx: { ml: `auto` },
                    children: (0, $.jsx)(l, {
                      variant: `contained`,
                      size: `small`,
                      startIcon: (0, $.jsx)(x, {}),
                      onClick: () => {
                        (setEmpNew(empSim), setDlgNew(!0));
                      },
                      sx: {
                        textTransform: `none`,
                        fontSize: `0.75rem`,
                        bgcolor: `#7e3ff2`,
                      },
                      children: `Déclarer une absence`,
                    }),
                  }),
                ],
              }),
              (0, $.jsxs)(a, {
                sx: {
                  display: `grid`,
                  gridTemplateColumns: `repeat(auto-fit,minmax(130px,1fr))`,
                  gap: 1.5,
                },
                children: [
                  (0, $.jsx)(AbsTuile, {
                    label: `Jours d'absence`,
                    valeur: mesJours + ` j`,
                  }),
                  (0, $.jsx)(AbsTuile, {
                    label: `Dossiers en cours`,
                    valeur: String(mesAtt),
                    couleur: mesAtt > 0 ? `warning.main` : null,
                  }),
                  (0, $.jsx)(AbsTuile, {
                    label: `Indemnités estimées`,
                    valeur: sldFCFA(mesIndem),
                  }),
                  (0, $.jsx)(AbsTuile, {
                    label: `Prochain retour`,
                    valeur: prochain ? A(prochain.date_fin) : `—`,
                  }),
                  (0, $.jsx)(AbsTuile, {
                    label: `Plafond maladie (86)`,
                    valeur: (() => {
                      var cu = 0;
                      srt.forEach((r2) => {
                        if (
                          ABS_SANT[r2.type_absence] &&
                          r2.statut !== `rejetee`
                        )
                          cu += r2.ouvr;
                      });
                      return cu + ` / ` + plafondM + ` j`;
                    })(),
                  }),
                ],
              }),
              (0, $.jsx)(i, {
                variant: `subtitle2`,
                sx: { mt: 2.5, mb: 1, fontWeight: 800 },
                children: `Mes dossiers — ` + mes.length,
              }),
              mes.length === 0
                ? (0, $.jsx)(i, {
                    variant: `body2`,
                    color: `text.secondary`,
                    children: `Aucun dossier d'absence sur cet exercice. Déclarez toute absence dès le premier jour (justificatif sous 48 h).`,
                  })
                : (0, $.jsx)(a, {
                    sx: { display: `flex`, flexDirection: `column`, gap: 1 },
                    children: mes.map((r) =>
                      (0, $.jsxs)(
                        a,
                        {
                          sx: {
                            display: `flex`,
                            alignItems: `center`,
                            gap: 1.5,
                            p: 1,
                            borderRadius: 2,
                            border: `1px solid`,
                            borderColor: `divider`,
                            flexWrap: `wrap`,
                          },
                          children: [
                            (0, $.jsx)(CT, {
                              sx: { fontSize: 18, color: `primary.main` },
                            }),
                            (0, $.jsxs)(a, {
                              sx: { minWidth: 0 },
                              children: [
                                (0, $.jsx)(i, {
                                  variant: `body2`,
                                  fontWeight: 700,
                                  children:
                                    absLibelle(r.type_absence) +
                                    ` · ` +
                                    A(r.date_debut) +
                                    ` → ` +
                                    A(r.date_fin),
                                }),
                                (0, $.jsx)(i, {
                                  variant: `caption`,
                                  color: `text.secondary`,
                                  children:
                                    r.ouvr +
                                    ` j ouvrables · ` +
                                    (r.motif || ``),
                                }),
                              ],
                            }),
                            (0, $.jsx)(a, {
                              sx: { ml: `auto` },
                              children: absChipStatut(r.statut),
                            }),
                          ],
                        },
                        r.id,
                      ),
                    ),
                  }),
              (0, $.jsxs)(o, {
                direction: `row`,
                spacing: 1.5,
                sx: { mt: 2.5 },
                children: [
                  (0, $.jsx)(l, {
                    variant: `outlined`,
                    size: `small`,
                    startIcon: (0, $.jsx)(CT, {}),
                    onClick: () =>
                      nav(`/domaine2_Gestion_Administrative_Personnel/conges`),
                    sx: { textTransform: `none`, fontSize: `0.75rem` },
                    children: `Mes congés annuels`,
                  }),
                ],
              }),
            ],
          }),
        }),
        absDlgNew(),
        (0, $.jsx)(d, {
          open: !!snack,
          autoHideDuration: 4e3,
          onClose: () => setSnack(null),
          anchorOrigin: { vertical: `bottom`, horizontal: `center` },
          message: snack ? snack.msg : ``,
        }),
      ],
    });
  }
  /* — Absences V3 : statistiques du pilotage visuel — */
  var chSt = { en_attente: 0, justifiee: 0, non_justifiee: 0, rejetee: 0 };
  srt.forEach((r) => {
    if (chSt[r.statut] !== undefined) chSt[r.statut] += 1;
  });
  var chDepts = (function () {
    var m = {};
    srt.forEach((r) => {
      var dp = (r.emp && r.emp.departement) || `—`;
      if (!m[dp]) m[dp] = { dept: dp, n: 0, j: 0, co: 0 };
      m[dp].n++;
      m[dp].j += r.ouvr || 0;
      m[dp].co += r.indem + r.coutR;
    });
    return Object.keys(m)
      .map((k2) => m[k2])
      .sort((a1, a2) => a2.j - a1.j)
      .slice(0, 8);
  })();
  var chDeptsMax = chDepts.length
    ? Math.max.apply(
        null,
        chDepts.map((x2) => x2.j),
      )
    : 0;
  var absMois = absMoisSerie(srt, exo === `tous` ? String(AN) : exo, FER);
  var absMoisMax = Math.max.apply(null, absMois.concat([0]));
  var absDD = absDeltaAn(ALL, exo === `tous` ? String(AN) : exo);
  /* — Vue RH / Manager : cockpit absentéisme complet — */
  return (0, $.jsxs)(o, {
    spacing: 2.5,
    sx: { width: `100%`, maxWidth: `100%`, minWidth: 0 },
    children: [
      (0, $.jsx)(J, {
        title: `Absences maladie — Cockpit absentéisme & conformité`,
        subtitle:
          `Exercice ` +
          (exo === `tous` ? `tous exercices confondus` : exo) +
          ` · décompte en jours ouvrables (fériés Cameroun déduits) · fusion temps réel : base + Congés Annuels V2 + déclarations locales · conformité CT Cameroun (art. 34-36, 83-93) & CNPS`,
        action: (0, $.jsxs)(o, {
          direction: `row`,
          spacing: 1,
          alignItems: `center`,
          children: [
            (0, $.jsx)(i, {
              variant: `caption`,
              sx: {
                color: `text.secondary`,
                display: { xs: `none`, md: `block` },
              },
              children: `Synchro ` + sync.toLocaleTimeString(),
            }),
            (0, $.jsxs)(l, {
              variant: `outlined`,
              size: `small`,
              onClick: fRefresh,
              sx: {
                textTransform: `none`,
                fontSize: `0.75rem`,
                minWidth: 0,
                px: { xs: 1, sm: 1.5 },
              },
              children: [
                (0, $.jsx)(RF, { sx: { fontSize: 18 } }),
                (0, $.jsx)(i, {
                  component: `span`,
                  sx: {
                    display: { xs: `none`, sm: `inline` },
                    fontSize: `inherit`,
                  },
                  children: `Actualiser`,
                }),
              ],
            }),
            (0, $.jsxs)(l, {
              variant: `outlined`,
              size: `small`,
              onClick: fExport,
              sx: {
                textTransform: `none`,
                fontSize: `0.75rem`,
                minWidth: 0,
                px: { xs: 1, sm: 1.5 },
              },
              children: [
                (0, $.jsx)(S, { sx: { fontSize: 18 } }),
                (0, $.jsx)(i, {
                  component: `span`,
                  sx: {
                    display: { xs: `none`, sm: `inline` },
                    fontSize: `inherit`,
                  },
                  children: `Export CSV`,
                }),
              ],
            }),
            (0, $.jsxs)(l, {
              variant: `contained`,
              size: `small`,
              onClick: () => {
                (setEmpNew(``), setDlgNew(!0));
              },
              sx: {
                textTransform: `none`,
                fontSize: `0.75rem`,
                minWidth: 0,
                px: { xs: 1, sm: 1.5 },
                bgcolor: `#7e3ff2`,
              },
              children: [
                (0, $.jsx)(x, { sx: { fontSize: 18 } }),
                (0, $.jsx)(i, {
                  component: `span`,
                  sx: {
                    display: { xs: `none`, sm: `inline` },
                    fontSize: `inherit`,
                  },
                  children: `Déclarer`,
                }),
              ],
            }),
            (0, $.jsx)(l, {
              variant: `outlined`,
              size: `small`,
              onClick: () => {
                var st = absStore();
                setCout((st.meta && st.meta.coutJour) || 15000);
                setPlafNew((st.meta && st.meta.plafondMaladie) || 130);
                setDlgPar(!0);
              },
              sx: {
                textTransform: `none`,
                fontSize: `0.75rem`,
                minWidth: 0,
                px: { xs: 1, sm: 1.5 },
              },
              children: [
                (0, $.jsx)(PYC, { sx: { fontSize: 18 } }),
                (0, $.jsx)(i, {
                  component: `span`,
                  sx: {
                    display: { xs: `none`, sm: `inline` },
                    fontSize: `inherit`,
                  },
                  children: `Paramètres`,
                }),
              ],
            }),
          ],
        }),
      }),
      exo !== `tous` && exo !== String(AN)
        ? (0, $.jsx)(c, {
            severity: `info`,
            sx: { fontWeight: 600 },
            children:
              `Exercice ` +
              AN +
              ` en cours (` +
              jRestants +
              ` jour(s) avant le 31/12) — l'exercice affiché ` +
              exo +
              ` est le plus documenté. Basculez via le filtre Exercice ou déclarez un dossier ` +
              AN +
              `.`,
          })
        : null,
      alCNPS.length > 0
        ? (0, $.jsx)(c, {
            severity: `error`,
            icon: (0, $.jsx)(w, {}),
            sx: {
              fontWeight: 600,
              overflowWrap: `anywhere`,
              "& .MuiAlert-action": { display: { xs: `none`, sm: `flex` } },
            },
            action: (0, $.jsx)(l, {
              color: `error`,
              size: `small`,
              onClick: () => (setTypeF(`accident_travail`), setPage(0)),
              sx: { textTransform: `none` },
              children: `Examiner`,
            }),
            children:
              alCNPS.length +
              ` accident(s) du travail à déclarer à la CNPS — délai légal 48 h (loi n° 98/004, art. 78) : risque de pénalité et de prise en charge refusée.`,
          })
        : null,
      alAbandon.length > 0
        ? (0, $.jsx)(c, {
            severity: `error`,
            icon: (0, $.jsx)(GV, {}),
            sx: {
              fontWeight: 600,
              overflowWrap: `anywhere`,
              "& .MuiAlert-action": { display: { xs: `none`, sm: `flex` } },
            },
            action: (0, $.jsx)(l, {
              color: `error`,
              size: `small`,
              onClick: () => (setStatutF(`a_reguler`), setPage(0)),
              sx: { textTransform: `none` },
              children: `Examiner`,
            }),
            children:
              alAbandon.length +
              ` absence(s) non justifiée(s) atteignent 8 jours ouvrables cumulés — engager la procédure disciplinaire / abandon de poste (art. 34-36 Code du travail).`,
          })
        : null,
      alVisite.length + alRelance.length > 0
        ? (0, $.jsx)(c, {
            severity: `warning`,
            sx: {
              fontWeight: 600,
              overflowWrap: `anywhere`,
              "& .MuiAlert-action": { display: { xs: `none`, sm: `flex` } },
            },
            action: (0, $.jsx)(l, {
              color: `warning`,
              size: `small`,
              onClick: () => (setStatutF(`a_reguler`), setPage(0)),
              sx: { textTransform: `none` },
              children: `Traiter`,
            }),
            children:
              alVisite.length +
              ` visite(s) de reprise à programmer (arrêt > 3 j — médecine du travail) · ` +
              alRelance.length +
              ` justificatif(s) à relancer (J+2).`,
          })
        : null,
      alBrad.length > 0
        ? (0, $.jsx)(c, {
            severity: `warning`,
            sx: {
              fontWeight: 600,
              overflowWrap: `anywhere`,
              "& .MuiAlert-action": { display: { xs: `none`, sm: `flex` } },
            },
            action: (0, $.jsx)(l, {
              color: `warning`,
              size: `small`,
              onClick: () => (setStatutF(`recommande`), setPage(0)),
              sx: { textTransform: `none` },
              children: `Voir`,
            }),
            children:
              alBrad.length +
              ` salarié(s) avec facteur de Bradford ≥ 450 (arrêts courts répétés) — entretien de prévention recommandé (lien burn-out : voir Soldes de congés).`,
          })
        : null,
      alPlaf.length > 0
        ? (0, $.jsx)(c, {
            severity: `warning`,
            icon: (0, $.jsx)(w, {}),
            sx: {
              fontWeight: 600,
              overflowWrap: `anywhere`,
              "& .MuiAlert-action": { display: { xs: `none`, sm: `flex` } },
            },
            action: (0, $.jsx)(l, {
              color: `warning`,
              size: `small`,
              onClick: () => (setStatutF(`plafond`), setPage(0)),
              sx: { textTransform: `none` },
              children: `Examiner`,
            }),
            children:
              alPlaf.length +
              ` salarié(s) approchent (≥ 80 %) ou atteignent le plafond maladie de 6 mois/an — art. 86 CT (plafond paramétré : ` +
              plafondM +
              ` j ouvrables). Anticiper la bascule sans rémunération.`,
          })
        : null,
      alCert.length > 0
        ? (0, $.jsx)(c, {
            severity: `error`,
            icon: (0, $.jsx)(w, {}),
            sx: {
              fontWeight: 600,
              overflowWrap: `anywhere`,
              "& .MuiAlert-action": { display: { xs: `none`, sm: `flex` } },
            },
            action: (0, $.jsx)(l, {
              color: `error`,
              size: `small`,
              onClick: () => (setStatutF(`cert_bad`), setPage(0)),
              sx: { textTransform: `none` },
              children: `Examiner`,
            }),
            children:
              alCert.length +
              ` certificat(s) médicaux suspect(s) — antidatés (émission après fin d'arrêt) ou émission tardive : vérifier avant paiement.`,
          })
        : null,
      (0, $.jsxs)(a, {
        sx: {
          display: `grid`,
          gridTemplateColumns: { xs: `1fr 1fr`, md: `repeat(5,1fr)` },
          gap: 2,
        },
        children: [
          (0, $.jsx)(AbsKpi, {
            ic: HSA,
            grad: !0,
            valeur: kpi.jours + ` j`,
            label: `Jours d'absence perdus`,
            sub:
              kpi.tauxAbs != null
                ? `taux d'absentéisme ` + kpi.tauxAbs + ` % (cible < 4 %)`
                : `tous exercices confondus`,
            actif:
              statutF === `tous` &&
              dept === `tous` &&
              typeF === `tous` &&
              !rech,
            onClic: () => {
              (setStatutF(`tous`),
                setDept(`tous`),
                setTypeF(`tous`),
                setRech(``),
                setPage(0));
            },
          }),
          (0, $.jsx)(AbsKpi, {
            ic: HEA,
            couleur: `warning.main`,
            valeur: String(kpi.aReg),
            label: `Dossiers à régulariser`,
            sub: `CNPS · visites reprise · relances · attentes`,
            actif: statutF === `a_reguler`,
            onClic: () => (
              setStatutF(statutF === `a_reguler` ? `tous` : `a_reguler`),
              setPage(0)
            ),
          }),
          (0, $.jsx)(AbsKpi, {
            ic: PYC,
            couleur: `error.main`,
            valeur: sldFCFA(kpi.coutTot),
            label: `Coût estimé`,
            sub: `indemnités légales + remplacements (paramétrable)`,
            actif: !1,
            onClic: () => fTri(`cout`),
          }),
          (0, $.jsx)(AbsKpi, {
            ic: SCH,
            couleur: `secondary.main`,
            valeur: String(kpi.bradf),
            label: `Récidives (Bradford ≥ 450)`,
            sub: `arrêts courts répétés — prévention burn-out`,
            actif: statutF === `recommande`,
            onClic: () => (
              setStatutF(statutF === `recommande` ? `tous` : `recommande`),
              setPage(0)
            ),
          }),
          (0, $.jsx)(AbsKpi, {
            ic: AB,
            couleur: `error.main`,
            valeur: sldFCFA(kpi.restes || 0),
            label: `Reste à récupérer CNPS`,
            sub: `avances AT/maternité non compensées par les IJ`,
            actif: statutF === `paie_restes`,
            onClic: () => (
              setStatutF(statutF === `paie_restes` ? `tous` : `paie_restes`),
              setPage(0)
            ),
          }),
        ],
      }),
      (0, $.jsxs)(a, {
        sx: {
          display: `flex`,
          gap: 1.5,
          flexWrap: `wrap`,
          alignItems: `center`,
        },
        children: [
          (0, $.jsx)(D, {
            size: `small`,
            placeholder: `Rechercher (nom, matricule, motif, type…)`,
            value: rech,
            onChange: (e2) => {
              (setRech(e2.target.value), setPage(0));
            },
            InputProps: {
              startAdornment: (0, $.jsx)(k, {
                sx: { fontSize: 18, mr: 1, color: `text.secondary` },
              }),
            },
            sx: {
              flex: 1,
              minWidth: 160,
              "& .MuiInput-root": { fontSize: `0.8rem` },
            },
          }),
          (0, $.jsxs)(D, {
            select: !0,
            size: `small`,
            label: `Statut`,
            value: statutF,
            onChange: (e2) => {
              (setStatutF(e2.target.value), setPage(0));
            },
            sx: { minWidth: 160, width: { xs: `100%`, sm: `auto` } },
            children: [
              (0, $.jsx)(s, { value: `tous`, children: `Tous les statuts` }),
              (0, $.jsx)(s, {
                value: `a_reguler`,
                children: `🔴 À régulariser (actions dues)`,
              }),
              (0, $.jsx)(s, {
                value: `non_justifiee`,
                children: `Non justifiée`,
              }),
              (0, $.jsx)(s, { value: `en_attente`, children: `En attente` }),
              (0, $.jsx)(s, { value: `justifiee`, children: `Justifiée` }),
              (0, $.jsx)(s, { value: `rejetee`, children: `Rejetée` }),
              (0, $.jsx)(s, {
                value: `recommande`,
                children: `🟠 Récidive Bradford ≥ 450`,
              }),
              (0, $.jsx)(s, {
                value: `plafond`,
                children: `🛑 Plafond maladie (art. 86)`,
              }),
              (0, $.jsx)(s, {
                value: `paie_restes`,
                children: `💳 Reste à récupérer CNPS`,
              }),
              (0, $.jsx)(s, {
                value: `cert_bad`,
                children: `⚠ Certificats suspects`,
              }),
            ],
          }),
          (0, $.jsxs)(D, {
            select: !0,
            size: `small`,
            label: `Type`,
            value: typeF,
            onChange: (e2) => {
              (setTypeF(e2.target.value), setPage(0));
            },
            sx: { minWidth: 170, width: { xs: `100%`, sm: `auto` } },
            children: [
              (0, $.jsx)(s, { value: `tous`, children: `Tous les types` }),
              Object.keys(ABS_TYPES).map((tk) =>
                (0, $.jsx)(s, { value: tk, children: ABS_TYPES[tk][0] }, tk),
              ),
            ],
          }),
          (0, $.jsxs)(D, {
            select: !0,
            size: `small`,
            label: `Exercice`,
            value: exo,
            onChange: (e2) => {
              (setExo(e2.target.value), setPage(0));
            },
            sx: { minWidth: 150, width: { xs: `100%`, sm: `auto` } },
            children: [
              (0, $.jsx)(s, { value: String(AN), children: `Exercice ` + AN }),
              (0, $.jsx)(s, {
                value: String(AN - 1),
                children: `Exercice ` + (AN - 1),
              }),
              (0, $.jsx)(s, {
                value: String(AN - 2),
                children: `Exercice ` + (AN - 2),
              }),
              (0, $.jsx)(s, { value: `tous`, children: `Tous exercices` }),
            ],
          }),
          dept !== `tous` || statutF !== `tous` || typeF !== `tous` || rech
            ? (0, $.jsx)(l, {
                size: `small`,
                onClick: () => {
                  (setDept(`tous`),
                    setStatutF(`tous`),
                    setTypeF(`tous`),
                    setRech(``),
                    setPage(0));
                },
                sx: { textTransform: `none`, fontSize: `0.75rem` },
                children: `Effacer les filtres`,
              })
            : null,
        ],
      }),
      (0, $.jsx)(a, {
        sx: { display: `flex`, gap: 0.75, flexWrap: `wrap`, mb: -0.5 },
        children: [
          (0, $.jsx)(T, {
            label: `Tous départements`,
            size: `small`,
            onClick: () => (setDept(`tous`), setPage(0)),
            color: dept === `tous` ? `primary` : `default`,
            variant: dept === `tous` ? `filled` : `outlined`,
            sx: { fontWeight: 700, fontSize: `0.72rem`, cursor: `pointer` },
          }),
          depts.map((dp) =>
            (0, $.jsx)(
              T,
              {
                label: dp,
                size: `small`,
                onClick: () => (setDept(dept === dp ? `tous` : dp), setPage(0)),
                color: dept === dp ? `primary` : `default`,
                variant: dept === dp ? `filled` : `outlined`,
                sx: { fontWeight: 700, fontSize: `0.72rem`, cursor: `pointer` },
              },
              dp,
            ),
          ),
        ],
      }),
      (0, $.jsx)(ee, {
        sx: { borderRadius: 3 },
        children: (0, $.jsxs)(u, {
          children: [
            (0, $.jsxs)(a, {
              sx: {
                display: `flex`,
                alignItems: `center`,
                gap: 1,
                mb: chOpen ? 1.5 : 0,
              },
              children: [
                (0, $.jsx)(AS2, { sx: { fontSize: 20, color: `#7e3ff2` } }),
                (0, $.jsx)(i, {
                  variant: `subtitle2`,
                  fontWeight: 800,
                  children: `Pilotage visuel`,
                }),
                (0, $.jsx)(a, {
                  sx: {
                    ml: `auto`,
                    display: `flex`,
                    alignItems: `center`,
                    gap: 1,
                  },
                  children: [
                    exo !== `tous`
                      ? (0, $.jsx)(T, {
                          label:
                            (absDD.d > 0 ? `▲ +` : absDD.d < 0 ? `▼ ` : `= `) +
                            Math.abs(absDD.d) +
                            ` j vs ` +
                            (parseInt(exo, 10) - 1),
                          size: `small`,
                          color:
                            absDD.d > 0
                              ? `error`
                              : absDD.d < 0
                                ? `success`
                                : `default`,
                          variant: `outlined`,
                          sx: { fontWeight: 800, fontSize: `0.68rem` },
                        })
                      : null,
                    (0, $.jsx)(l, {
                      size: `small`,
                      onClick: () => setCh(chOpen ? 0 : 1),
                      sx: {
                        textTransform: `none`,
                        fontSize: `0.72rem`,
                        minWidth: 0,
                      },
                      children: chOpen ? `Masquer` : `Afficher`,
                    }),
                  ],
                }),
              ],
            }),
            chOpen
              ? (0, $.jsxs)(a, {
                  sx: {
                    display: `grid`,
                    gridTemplateColumns: { xs: `1fr`, md: `1fr 1fr` },
                    gap: 2.5,
                    overflowX: `auto`,
                  },
                  children: [
                    (0, $.jsxs)(a, {
                      children: [
                        (0, $.jsx)(i, {
                          variant: `caption`,
                          fontWeight: 800,
                          sx: {
                            color: `text.secondary`,
                            display: `block`,
                            mb: 1,
                          },
                          children:
                            `Répartition des dossiers — ` +
                            srt.length +
                            ` dossier(s) affiché(s)`,
                        }),
                        (0, $.jsx)(a, {
                          sx: {
                            display: `flex`,
                            flexDirection: `column`,
                            gap: 1,
                          },
                          children: [
                            {
                              k: `en_attente`,
                              l: `En attente`,
                              c: `warning.main`,
                              n: chSt.en_attente,
                            },
                            {
                              k: `justifiee`,
                              l: `Justifiée`,
                              c: `success.main`,
                              n: chSt.justifiee,
                            },
                            {
                              k: `non_justifiee`,
                              l: `Non justifiée`,
                              c: `error.main`,
                              n: chSt.non_justifiee,
                            },
                            {
                              k: `rejetee`,
                              l: `Rejetée`,
                              c: `text.disabled`,
                              n: chSt.rejetee,
                            },
                          ].map((x2) =>
                            (0, $.jsxs)(
                              a,
                              {
                                sx: {
                                  display: `flex`,
                                  alignItems: `center`,
                                  gap: 1,
                                },
                                children: [
                                  (0, $.jsx)(a, {
                                    sx: { width: 92, flexShrink: 0 },
                                    children: (0, $.jsx)(i, {
                                      variant: `caption`,
                                      fontWeight: 700,
                                      children: x2.l,
                                    }),
                                  }),
                                  (0, $.jsx)(a, {
                                    sx: {
                                      flex: 1,
                                      height: 10,
                                      borderRadius: 5,
                                      bgcolor: `action.hover`,
                                      overflow: `hidden`,
                                    },
                                    children: (0, $.jsx)(a, {
                                      sx: {
                                        width:
                                          (srt.length
                                            ? Math.round(
                                                (x2.n / srt.length) * 100,
                                              )
                                            : 0) + `%`,
                                        height: `100%`,
                                        bgcolor: x2.c,
                                      },
                                    }),
                                  }),
                                  (0, $.jsx)(i, {
                                    variant: `caption`,
                                    fontWeight: 800,
                                    sx: { width: 22, textAlign: `right` },
                                    children: String(x2.n),
                                  }),
                                ],
                              },
                              x2.k,
                            ),
                          ),
                        }),
                        (0, $.jsx)(i, {
                          variant: `caption`,
                          fontWeight: 800,
                          sx: {
                            color: `text.secondary`,
                            display: `block`,
                            mb: 1,
                            mt: 2,
                          },
                          children:
                            `Évolution mensuelle ` +
                            (exo === `tous` ? AN : exo) +
                            ` — jours ouvrables perdus`,
                        }),
                        (0, $.jsx)(a, {
                          sx: {
                            display: `flex`,
                            alignItems: `flex-end`,
                            gap: 0.5,
                            height: 64,
                            maxWidth: `100%`,
                          },
                          children: absMois.map((v2, ix) =>
                            (0, $.jsxs)(
                              a,
                              {
                                title: `M` + (ix + 1) + ` : ` + v2 + ` j`,
                                sx: {
                                  flex: 1,
                                  display: `flex`,
                                  flexDirection: `column`,
                                  justifyContent: `flex-end`,
                                  alignItems: `center`,
                                  gap: 0.25,
                                  minWidth: 0,
                                },
                                children: [
                                  v2 > 0
                                    ? (0, $.jsx)(i, {
                                        variant: `caption`,
                                        sx: {
                                          fontSize: `0.55rem`,
                                          fontWeight: 800,
                                          color: `text.secondary`,
                                        },
                                        children: String(v2),
                                      })
                                    : null,
                                  (0, $.jsx)(a, {
                                    sx: {
                                      width: `100%`,
                                      height:
                                        (absMoisMax
                                          ? Math.max(
                                              4,
                                              Math.round(
                                                (v2 / absMoisMax) * 46,
                                              ),
                                            )
                                          : 4) + `px`,
                                      borderRadius: 1,
                                      bgcolor:
                                        v2 > 0 ? `#7e3ff2` : `action.hover`,
                                    },
                                  }),
                                  (0, $.jsx)(i, {
                                    variant: `caption`,
                                    sx: {
                                      fontSize: `0.55rem`,
                                      color: `text.secondary`,
                                    },
                                    children: String(ix + 1),
                                  }),
                                ],
                              },
                              ix,
                            ),
                          ),
                        }),
                      ],
                    }),
                    (0, $.jsxs)(a, {
                      children: [
                        (0, $.jsx)(i, {
                          variant: `caption`,
                          fontWeight: 800,
                          sx: {
                            color: `text.secondary`,
                            display: `block`,
                            mb: 1,
                          },
                          children: `Absentéisme par département — jours perdus, cliquez pour filtrer`,
                        }),
                        (0, $.jsx)(a, {
                          sx: {
                            display: `flex`,
                            flexDirection: `column`,
                            gap: 0.75,
                            maxHeight: 210,
                            overflowY: `auto`,
                          },
                          children: chDepts.map((x2) =>
                            (0, $.jsxs)(
                              a,
                              {
                                onClick: () => (
                                  setDept(dept === x2.dept ? `tous` : x2.dept),
                                  setPage(0)
                                ),
                                sx: {
                                  display: `flex`,
                                  alignItems: `center`,
                                  gap: 1,
                                  cursor: `pointer`,
                                  p: 0.5,
                                  borderRadius: 1,
                                  "&:hover": { bgcolor: `action.hover` },
                                },
                                children: [
                                  (0, $.jsx)(T, {
                                    label: x2.dept,
                                    size: `small`,
                                    variant:
                                      dept === x2.dept ? `filled` : `outlined`,
                                    color:
                                      dept === x2.dept ? `primary` : `default`,
                                    sx: {
                                      fontWeight: 700,
                                      fontSize: `0.65rem`,
                                      minWidth: 90,
                                    },
                                  }),
                                  (0, $.jsx)(i, {
                                    variant: `caption`,
                                    sx: {
                                      width: 96,
                                      flexShrink: 0,
                                      color: `text.secondary`,
                                    },
                                    children: x2.n + ` doss. · ` + x2.j + ` j`,
                                  }),
                                  (0, $.jsx)(a, {
                                    sx: {
                                      flex: 1,
                                      height: 8,
                                      borderRadius: 4,
                                      bgcolor: `action.hover`,
                                      overflow: `hidden`,
                                    },
                                    children: (0, $.jsx)(a, {
                                      sx: {
                                        width:
                                          (chDeptsMax
                                            ? Math.round(
                                                (x2.j / chDeptsMax) * 100,
                                              )
                                            : 0) + `%`,
                                        height: `100%`,
                                        bgcolor: `#7e3ff2`,
                                      },
                                    }),
                                  }),
                                  (0, $.jsx)(i, {
                                    variant: `caption`,
                                    fontWeight: 800,
                                    children: x2.co ? sldFCFA(x2.co) : `—`,
                                  }),
                                ],
                              },
                              x2.dept,
                            ),
                          ),
                        }),
                      ],
                    }),
                  ],
                })
              : null,
          ],
        }),
      }),
      (0, $.jsx)(ee, {
        children: (0, $.jsxs)(u, {
          children: [
            (0, $.jsx)(y, {
              sx: { overflowX: `auto`, maxWidth: `100%` },
              children: (0, $.jsxs)(ne, {
                size: `small`,
                stickyHeader: !0,
                children: [
                  (0, $.jsx)(te, {
                    children: (0, $.jsxs)(b, {
                      children: [
                        fTh(`Employé`, `employe`),
                        fTh(`Département`, `dept`),
                        fTh(`Type`, `type`),
                        fTh(`Période`, `debut`),
                        fTh(`Durée (ouvr.)`, `duree`, `right`),
                        (0, $.jsx)(v, {
                          sx: { fontWeight: 700 },
                          children: `Conformité`,
                        }),
                        fTh(`Indemnité estimée`, `cout`, `right`),
                        (0, $.jsx)(v, {
                          sx: { fontWeight: 700 },
                          children: `Statut`,
                        }),
                        (0, $.jsx)(v, {
                          align: `center`,
                          sx: { fontWeight: 700 },
                          children: `Actions`,
                        }),
                      ],
                    }),
                  }),
                  (0, $.jsx)(_, {
                    children: srt
                      .slice(page * pp, page * pp + pp)
                      .map((rw, idx) =>
                        (0, $.jsxs)(
                          b,
                          {
                            hover: !0,
                            onClick: () => openDet(rw),
                            sx: { cursor: `pointer` },
                            children: [
                              (0, $.jsxs)(v, {
                                children: [
                                  (0, $.jsxs)(a, {
                                    sx: {
                                      display: `flex`,
                                      alignItems: `center`,
                                      gap: 1.2,
                                    },
                                    children: [
                                      sldAvatar(rw.emp || {}, 34, 12),
                                      (0, $.jsxs)(a, {
                                        sx: { minWidth: 0 },
                                        children: [
                                          (0, $.jsx)(i, {
                                            variant: `body2`,
                                            fontWeight: 700,
                                            noWrap: !0,
                                            children: rw.emp
                                              ? B(rw.emp)
                                              : rw.employee_id,
                                          }),
                                          (0, $.jsx)(i, {
                                            variant: `caption`,
                                            sx: {
                                              color: `text.secondary`,
                                              fontFamily: `monospace`,
                                            },
                                            children:
                                              (rw.emp && rw.emp.matricule) ||
                                              ``,
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              (0, $.jsx)(v, {
                                children: (0, $.jsx)(T, {
                                  label: (rw.emp && rw.emp.departement) || `—`,
                                  size: `small`,
                                  variant: `outlined`,
                                  sx: { fontSize: `0.68rem`, fontWeight: 700 },
                                }),
                              }),
                              (0, $.jsxs)(v, {
                                children: [
                                  (0, $.jsx)(T, {
                                    label: absLibelle(rw.type_absence),
                                    size: `small`,
                                    color:
                                      rw.fl.abandon || rw.fl.cnpsLate
                                        ? `error`
                                        : rw.type_absence ===
                                            `absence_non_justifiee`
                                          ? `warning`
                                          : `primary`,
                                    variant: `outlined`,
                                    sx: {
                                      fontWeight: 700,
                                      fontSize: `0.66rem`,
                                    },
                                  }),
                                  (0, $.jsx)(i, {
                                    variant: `caption`,
                                    sx: {
                                      display: `block`,
                                      color: `text.secondary`,
                                    },
                                    children: rw.motif || ``,
                                  }),
                                ],
                              }),
                              (0, $.jsxs)(v, {
                                children: [
                                  (0, $.jsx)(i, {
                                    variant: `body2`,
                                    fontWeight: 700,
                                    noWrap: !0,
                                    children:
                                      A(rw.date_debut) + ` → ` + A(rw.date_fin),
                                  }),
                                  (0, $.jsx)(a, {
                                    sx: {
                                      display: `flex`,
                                      alignItems: `center`,
                                      gap: 0.5,
                                      mt: 0.25,
                                    },
                                    children: absChipSource(rw.source),
                                  }),
                                ],
                              }),
                              (0, $.jsxs)(v, {
                                align: `right`,
                                children: [
                                  (0, $.jsx)(i, {
                                    variant: `body2`,
                                    fontWeight: 800,
                                    children: rw.ouvr + ` j`,
                                  }),
                                  (0, $.jsx)(i, {
                                    variant: `caption`,
                                    sx: {
                                      display: `block`,
                                      color: `text.secondary`,
                                    },
                                    children: rw.cal + ` j cal.`,
                                  }),
                                ],
                              }),
                              (0, $.jsx)(v, { children: absChipConf(rw.fl) }),
                              (0, $.jsxs)(v, {
                                align: `right`,
                                children: [
                                  (0, $.jsx)(i, {
                                    variant: `body2`,
                                    fontWeight: 700,
                                    children:
                                      rw.indem > 0 ? sldFCFA(rw.indem) : `—`,
                                  }),
                                  rw.coutR > 0
                                    ? (0, $.jsx)(i, {
                                        variant: `caption`,
                                        sx: {
                                          display: `block`,
                                          color: `error.main`,
                                          fontWeight: 700,
                                        },
                                        children:
                                          `+ ` + sldFCFA(rw.coutR) + ` remp.`,
                                      })
                                    : null,
                                ],
                              }),
                              (0, $.jsxs)(v, {
                                children: [
                                  absChipStatut(rw.statut),
                                  rw.plf && rw.plf.etat !== `ok`
                                    ? (0, $.jsx)(T, {
                                        label:
                                          rw.plf.etat === `fin`
                                            ? `Fin de droits (86)`
                                            : `Plafond 86 : ` +
                                              rw.plf.pct +
                                              `%`,
                                        size: `small`,
                                        color:
                                          rw.plf.etat === `fin`
                                            ? `error`
                                            : `warning`,
                                        variant:
                                          rw.plf.etat === `fin`
                                            ? `filled`
                                            : `outlined`,
                                        sx: {
                                          fontWeight: 800,
                                          fontSize: `0.6rem`,
                                          mt: 0.5,
                                        },
                                      })
                                    : null,
                                ],
                              }),
                              (0, $.jsx)(v, {
                                align: `center`,
                                children: (0, $.jsx)(o, {
                                  direction: `row`,
                                  spacing: 0.5,
                                  justifyContent: `center`,
                                  children: (0, $.jsx)(E, {
                                    title: `Détail du dossier`,
                                    children: (0, $.jsx)(r, {
                                      size: `small`,
                                      color: `primary`,
                                      onClick: (e2) => (
                                        e2.stopPropagation(),
                                        openDet(rw)
                                      ),
                                      children: (0, $.jsx)(C, {
                                        fontSize: `small`,
                                      }),
                                    }),
                                  }),
                                }),
                              }),
                            ],
                          },
                          rw.id || idx,
                        ),
                      ),
                  }),
                  srt.length === 0
                    ? (0, $.jsx)(b, {
                        children: (0, $.jsx)(v, {
                          colSpan: 9,
                          align: `center`,
                          sx: { py: 4, color: `text.secondary` },
                          children: `Aucun dossier d'absence ne correspond aux filtres actifs — déclarez une absence ou changez d'exercice.`,
                        }),
                      })
                    : null,
                ],
              }),
            }),
            (0, $.jsx)(g, {
              component: `div`,
              count: srt.length,
              page: page,
              onPageChange: (e2, p2) => setPage(p2),
              rowsPerPage: pp,
              onRowsPerPageChange: (e2) => {
                (setPp(parseInt(e2.target.value)), setPage(0));
              },
              rowsPerPageOptions: [10, 20, 50],
              labelRowsPerPage: `Lignes:`,
              labelDisplayedRows: (pg2) =>
                pg2.from + `-` + pg2.to + ` sur ` + pg2.count,
              sx: { mt: 1 },
            }),
          ],
        }),
      }),
      absDlgDetail(),
      absDlgNew(),
      absDlgParams(),
      absDlgLettres(),
      (0, $.jsx)(d, {
        open: !!snack,
        autoHideDuration: 4e3,
        onClose: () => setSnack(null),
        anchorOrigin: { vertical: `bottom`, horizontal: `center` },
        message: snack ? snack.msg : ``,
      }),
    ],
  });
}

export { ie as default };
