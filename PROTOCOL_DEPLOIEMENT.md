# PROTOCOLE DE DÉPLOIEMENT — Admina-RH (obligatoire pour toute session)

## Contexte

Entre le 12 et le 14/09/2026, plusieurs sessions travaillant en parallèle sur le même projet
Cloudflare Pages (`admina-rh`) ont déployé chacune leur staging local sans coordination,
écrasant réciproquement le travail des autres. La production a été écrasée au moins 7 fois,
dont 4 fois par un staging périmé de plusieurs versions (module Coûts, D10 21 écrans et D9 V28
disparaissaient du site public). Chaque session partage le même compte Cloudflare mais ni la
mémoire ni le disque des autres : la seule source de vérité commune est ce dépôt GitHub.

## Principe fondamental

**GitHub = état de référence.** Le fichier `COORDINATION/deployments.json` sur `main` indique :
quel déploiement est en production, les empreintes md5 de référence du site live, et qui
travaille sur quoi (verrous). Toute session le lit AVANT de commencer et le met à jour APRÈS
toute publication.

---

## Règle 1 — La production est verrouillée

- **INTERDIT** de déployer sur la branche de production (`--branch=main`) sans accord
  explicite de l'utilisateur **et** pré-vol anti-écrasement réussi (Règle 5).
- **Autorisé et recommandé** : déployer en branche preview à ton nom :

```bash
npx wrangler pages deploy . --project-name=admina-rh --branch=staging-<ton-nom>
```

- L'URL `https://staging-<ton-nom>.admina-rh-bd0.pages.dev` t'est réservée et n'affecte
  **jamais** la production. C'est la seule voie de publication par défaut.

## Règle 2 — Avant de commencer : lire l'état de référence

```bash
# 1. État de référence partagé
curl -s https://raw.githubusercontent.com/georgyfr/Admina_RH/main/COORDINATION/deployments.json

# 2. État live actuel (cache-buster obligatoire)
curl -s "https://admina-rh-bd0.pages.dev/?cb=$(date +%s)" | md5sum
curl -s "https://admina-rh-bd0.pages.dev/Domaine10_Talents_Mobilite_Interne/?cb=$(date +%s)" | md5sum
```

Compare les md5 obtenus avec `etat_production.baselines_md5` :
- **Identiques** → le live correspond à la référence, ta copie locale peut être comparée.
- **Différents** → quelqu'un a déployé après la dernière synchronisation : ta copie locale
  est très probablement périmée (voir Règle 3).

## Règle 3 — Si ton local est périmé : overlay, jamais ré-import

**Ne redéploie JAMAIS ton vieux staging.** C'est exactement le mécanisme qui a causé les
écrasements. Procédure correcte :

1. Télécharge le site live complet (ou les dossiers de ton périmètre).
2. Diff avec ton local : le live gagne partout où il est plus récent.
3. Ajoute uniquement TES nouveautés par-dessus (overlay union).
4. Déploie l'union (en preview d'abord, Règle 1).

## Règle 4 — Verrous par périmètre

Avant de travailler sur un domaine, déclare un verrou dans
`COORDINATION/deployments.json` → tableau `verrous` (commit sur `main`) :

```json
{
  "domaine": "Domaine11_Droit_Travail_Conformite",
  "session": "chat-<ton-nom>",
  "acquis_le": "2026-09-14T10:00:00Z",
  "expire_le": "2026-09-14T12:00:00Z",
  "perimetre": "Domaine11_*"
}
```

- Durée maximale : 2 heures (renouvelable).
- Respecte les verrous actifs des autres sessions : ne touche pas à leur périmètre.
- Après publication : retire ton verrou et ajoute une ligne dans `historique_recent`.

## Règle 5 — Promotion en production (exceptionnelle)

Conditions **cumulatives**, sans exception :

1. L'utilisateur a donné son accord explicite pour CE déploiement précis.
2. **Pré-vol anti-écrasement réussi** :
   - Le dernier déploiement Cloudflare (API `pages/projects/admina-rh/deployments`) a pour ID
     `etat_production.deployment_id` — sinon quelqu'un a déployé entre-temps → STOP.
   - Les md5 live correspondent aux `baselines_md5` — sinon état inattendu → STOP.
3. Déploiement, puis **immédiatement** : mise à jour de `deployments.json`
   (nouveau `deployment_id`, date, md5, historique) + push GitHub.
4. Vérification live complète (md5 de tous les fichiers critiques avec cache-buster).

## Règle 6 — Interdictions absolues

- Ne supprime **aucun** déploiement Cloudflare existant, même s'il te semble erroné.
- Ne force-push jamais `main` sur GitHub.
- Ne modifie pas `etat_production` sans déploiement réel correspondant.
- Ne touche pas au périmètre d'un verrou actif d'une autre session.

## Règle 7 — En cas d'incident

Tu t'es fait écraser, ou tu découvres avoir écrasé :

1. **Ne redéploie pas aveuglément.**
2. Signale l'incident dans `historique_recent` et préviens l'utilisateur.
3. Reconstruis l'union (Règle 3) puis demande la promotion (Règle 5).

---

## Bloc à coller au début de chaque nouvelle session

> RÈGLES DE DÉPLOIEMENT ADMINA-RH (obligatoires — incident du 12-14/09) :
> 1. INTERDICTION de déployer en production : ne JAMAIS utiliser `--branch=main` sur le
>    projet Pages `admina-rh`.
> 2. Déploie UNIQUEMENT en preview : `npx wrangler pages deploy . --project-name=admina-rh
>    --branch=staging-<ton-nom>`.
> 3. Avant tout travail : lis `COORDINATION/deployments.json` sur GitHub
>    (georgyfr/Admina_RH, branche main) et vérifie le live avec cache-buster.
> 4. Si le live contient déjà du travail plus récent que ton local : base-toi sur le live
>    (overlay), ne réimporte jamais ton vieux build.
> 5. Ne supprime aucun déploiement Cloudflare. Protocole complet :
>    `PROTOCOL_DEPLOIEMENT.md` à la racine du dépôt.
