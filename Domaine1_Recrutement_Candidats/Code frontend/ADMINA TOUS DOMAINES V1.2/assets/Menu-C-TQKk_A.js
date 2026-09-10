<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Admina-RH — Tous les Domaines</title>
<meta name="description" content="Plateforme Admina-RH : 31 domaines de gestion RH. Chaque domaine dispose d'une URL dédiée sous admina-rh-bd0.pages.dev." />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<script>
/* Admina-RH — entrée multi-domaines.
 * Ce document est servi à la racine (hub) ET par le fallback SPA automatique de
 * Cloudflare Pages pour tout chemin non physique (deep-links /demandes, /candidats,
 * /domaine2_Gestion_Administrative_Personnel/..., sans _redirects → URL préservée).
 * À la racine : hub des 31 domaines. Ailleurs : bascule immédiate vers l'application
 * (/Domaine1_Recrutement_Candidats/) avec le chemin d'origine dans le fragment
 * #adem_r= — V11c le restaure avant le montage du routeur React. */
(function () {
  var p = location.pathname;
  if (p === '/' || p === '/index.html') return;
  location.replace('/Domaine1_Recrutement_Candidats/index.html#adem_r=' +
    encodeURIComponent(p + location.search));
})();
</script>
<style>
:root{--bg:#0d0d1a;--card:#15152a;--card2:#191932;--border:rgba(255,255,255,.09);--txt:#eef0ff;
--mut:#9aa0c3;--acc:#9375cd;--acc2:#5e35a1;--ok:#3ad29f;--warn:#f5b74e}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;background:
radial-gradient(1200px 500px at 70% -10%,rgba(94,53,161,.28),transparent),var(--bg);color:var(--txt);
min-height:100vh;display:flex;flex-direction:column}
.wrap{width:min(1180px,92%);margin:0 auto}
header{padding:22px 0;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:14px}
header .wrap{display:flex;align-items:center;gap:14px;width:min(1180px,92%)}
.logo{width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,var(--acc),var(--acc2));
display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px;letter-spacing:.5px;
box-shadow:0 6px 18px rgba(94,53,161,.45)}
.brand b{font-size:1.12rem}
.brand small{display:block;color:var(--mut);font-size:.76rem;letter-spacing:.06em;text-transform:uppercase}
.gh{margin-left:auto;color:var(--mut);text-decoration:none;font-size:.86rem;border:1px solid var(--border);
padding:8px 14px;border-radius:10px;transition:.2s}
.gh:hover{color:var(--txt);border-color:var(--acc)}
.hero{padding:52px 0 26px}
.hero h1{font-size:clamp(1.6rem,3.4vw,2.3rem);font-weight:800}
.hero h1 span{background:linear-gradient(90deg,var(--acc),#c9b3ff);-webkit-background-clip:text;background-clip:text;color:transparent}
.hero p{color:var(--mut);margin-top:10px;max-width:760px;line-height:1.65;font-size:.97rem}
.meta{display:flex;gap:10px;margin-top:18px;flex-wrap:wrap;align-items:center}
.chip{font-size:.78rem;font-weight:600;padding:6px 12px;border-radius:999px;border:1px solid var(--border);color:var(--mut)}
.chip.ok{color:var(--ok);border-color:rgba(58,210,159,.4);background:rgba(58,210,159,.08)}
.search{margin:8px 0 6px;width:min(460px,100%)}
.search input{width:100%;padding:12px 16px;border-radius:12px;border:1px solid var(--border);
background:var(--card);color:var(--txt);font-size:.95rem;outline:none;transition:.2s}
.search input:focus{border-color:var(--acc)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;padding:18px 0 40px}
.card{display:block;text-decoration:none;color:inherit;background:var(--card);border:1px solid var(--border);
border-radius:16px;padding:18px;transition:transform .18s,border-color .18s,background .18s;position:relative}
.card:hover{transform:translateY(-3px);border-color:var(--acc);background:var(--card2)}
.card .top{display:flex;align-items:center;gap:12px;margin-bottom:10px}
.num{width:42px;height:42px;border-radius:11px;background:rgba(147,117,205,.14);border:1px solid rgba(147,117,205,.35);
color:#c9b3ff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.82rem;flex:none}
.card h3{font-size:1rem;font-weight:700;line-height:1.3}
.card p{color:var(--mut);font-size:.85rem;line-height:1.55;min-height:52px}
.card .foot{display:flex;align-items:center;justify-content:space-between;margin-top:12px}
.st{font-size:.72rem;font-weight:700;letter-spacing:.05em;padding:5px 10px;border-radius:999px}
.st.ok{color:var(--ok);background:rgba(58,210,159,.1);border:1px solid rgba(58,210,159,.4)}
.st.warn{color:var(--warn);background:rgba(245,183,78,.08);border:1px solid rgba(245,183,78,.35)}
.go{color:var(--acc);font-size:.85rem;font-weight:600}
.card.actif{border-color:rgba(147,117,205,.4);background:linear-gradient(180deg,rgba(147,117,205,.07),transparent),var(--card)}
.empty{color:var(--mut);padding:30px 0;display:none}
footer{border-top:1px solid var(--border);padding:22px 0;color:var(--mut);font-size:.82rem;line-height:1.7}
footer b{color:var(--txt)}
footer a{color:var(--acc);text-decoration:none}
@media(max-width:640px){header{padding:16px 0}.hero{padding:34px 0 18px}.card p{min-height:0}}
</style>
</head>
<body>
<header>
  <div class="wrap">
    <div class="logo">AR</div>
    <div class="brand"><b>Admina-RH</b><small>Plateforme de Gestion RH</small></div>
    <a class="gh" href="https://github.com/georgyfr/Admina_RH" target="_blank" rel="noopener noreferrer">Dépôt GitHub ↗</a>
  </div>
</header>
<main class="wrap">
  <section class="hero">
    <h1>Tous les <span>Domaines RH</span></h1>
    <p>Bienvenue sur la plateforme <b>Admina-RH</b>. Chaque domaine fonctionnel dispose de sa propre
    adresse dédiée sous la base <b>admina-rh-bd0.pages.dev</b>. Les domaines actifs ouvrent l'application
    correspondante ; les domaines en préparation disposent déjà de leur adresse réservée.</p>
    <div class="meta">
      <span class="chip ok">● 6 domaines actifs</span>
      <span class="chip">31 domaines</span>
      <span class="chip">Base commune : admina-rh-bd0.pages.dev</span>
    </div>
    <div class="search"><input id="q" type="search" placeholder="Rechercher un domaine…" autocomplete="off" /></div>
  </section>
  <section class="grid" id="grid"></section>
  <p class="empty" id="empty">Aucun domaine ne correspond à votre recherche.</p>
</main>
<footer>
  <div class="wrap">
    <b>Admina-RH</b> — Système Intégré de Gestion des Ressources Humaines · conforme ISO 30401 / ISO 9001.<br />
    Page d'accueil multi-domaines · source : <a href="https://github.com/georgyfr/Admina_RH" target="_blank" rel="noopener noreferrer">github.com/georgyfr/Admina_RH</a>
  </div>
</footer>
<script>
var DOMAINS = [{"num": 1, "url": "/Domaine1_Recrutement_Candidats", "label": "Recrutement & Candidats", "desc": "Offres d'emploi, demandes de recrutement, base candidats, entretiens et intégration.", "active": true}, {"num": 2, "url": "/Domaine2_Gestion_Administrative_Personnel", "label": "Gestion Administrative du Personnel", "desc": "Dossiers employés, contrats, présence, absences et documents administratifs.", "active": true}, {"num": 3, "url": "/Domaine3_Paie_Remuneration_Avantages/", "label": "Paie, Rémunération & Avantages", "desc": "Bulletins de paie, calcul des salaires, primes, avantages et cotisations.", "active": true}, {"num": 4, "url": "/Domaine4_Temps_Travail_Planification/", "label": "Temps de Travail & Planification", "desc": "Plannings, horaires, temps de travail et planification des équipes.", "active": true}, {"num": 5, "url": "/Domaine5_Conges_Absences_Presence/", "label": "Congés, Absences & Présence", "desc": "Demandes de congés, soldes, absences et suivi de présence.", "active": true}, {"num": 6, "url": "/Domaine6_Formation_Developpement_Competences/", "label": "Formation & Développement des Compétences", "desc": "Plans de formation, catalogues et montée en compétences.", "active": true}, {"num": 7, "url": "/Domaine7_Evaluation_Gestion_Performance/", "label": "Évaluation & Gestion de la Performance", "desc": "Objectifs, entretiens annuels et évaluations de performance.", "active": false}, {"num": 8, "url": "/Domaine8_Relations_Sociales_Syndicats/", "label": "Relations Sociales & Syndicats", "desc": "CSE, délégués, accords collectifs et dialogue social.", "active": false}, {"num": 9, "url": "/Domaine9_Sante_Securite_Conditions_Travail/", "label": "Santé, Sécurité & Conditions de Travail", "desc": "Prévention, visites médicales, accidents du travail et SST.", "active": false}, {"num": 10, "url": "/Domaine10_Talents_Mobilite_Interne/", "label": "Talents & Mobilité Interne", "desc": "Gestion des talents, plans de carrière et mobilité interne.", "active": false}, {"num": 11, "url": "/Domaine11_Droit_Travail_Conformite/", "label": "Droit du Travail & Conformité", "desc": "Veille juridique, conformité légale et obligations de l'employeur.", "active": false}, {"num": 12, "url": "/Domaine12_Documentation_Archivage_RH/", "label": "Documentation & Archivage RH", "desc": "Gestion documentaire, archivage et durées de conservation.", "active": false}, {"num": 13, "url": "/Domaine13_Communication_RH_Marque_Employeur/", "label": "Communication RH & Marque Employeur", "desc": "Communication RH, marque employeur et attractivité.", "active": false}, {"num": 14, "url": "/Domaine14_Reporting_Tableaux_Bord_Analyse/", "label": "Reporting & Tableaux de Bord Analyse", "desc": "KPIs RH, reporting et analyses décisionnelles.", "active": false}, {"num": 15, "url": "/Domaine15_Budget_Pilotage_Financier_RH/", "label": "Budget & Pilotage Financier RH", "desc": "Masse salariale, budgets RH et pilotage financier.", "active": false}, {"num": 16, "url": "/Domaine16_Diversite_Equite_Inclusion/", "label": "Diversité, Équité & Inclusion", "desc": "Égalité professionnelle, diversité et inclusion.", "active": false}, {"num": 17, "url": "/Domaine17_Audit_Conformite_Contentieux/", "label": "Audit, Conformité & Contentieux", "desc": "Audits RH, contentieux et gestion des risques sociaux.", "active": false}, {"num": 18, "url": "/Domaine18_RSE_Developpement_Durable_RH/", "label": "RSE & Développement Durable", "desc": "Responsabilité sociétale et durabilité des pratiques RH.", "active": false}, {"num": 19, "url": "/Domaine19_Innovation_RH_Transformation_Digitale/", "label": "Innovation RH & Transformation Digitale", "desc": "Digitalisation des RH et innovation sociale.", "active": false}, {"num": 20, "url": "/Domaine20_Pilotage_Reporting_RH/", "label": "Pilotage & Reporting RH", "desc": "Pilotage stratégique et reporting consolidé.", "active": false}, {"num": 21, "url": "/Domaine21_Fiches_Postes_Profils_Cartographie_Metiers/", "label": "Fiches de Postes & Cartographie des Métiers", "desc": "Référentiel métiers, fiches de poste et profils.", "active": false}, {"num": 22, "url": "/Domaine22_Avantages_Sociaux_Previsionnelle/", "label": "Avantages Sociaux & Prévoyance", "desc": "Mutuelle, prévoyance, retraite et avantages sociaux.", "active": false}, {"num": 23, "url": "/Domaine23_Travail_Temporaire/", "label": "Travail Temporaire", "desc": "Intérim, contrats courts et missions temporaires.", "active": false}, {"num": 24, "url": "/Domaine24_Stagiaires_Alternants/", "label": "Stagiaires & Alternants", "desc": "Stages, alternances et conventions.", "active": false}, {"num": 25, "url": "/Domaine25_Expatries_Personnel_Detache/", "label": "Expatriés & Personnel Détaché", "desc": "Mobilité internationale et personnel détaché.", "active": false}, {"num": 26, "url": "/Domaine26_Gestion_Budgetaire_Fiscale_RH/", "label": "Gestion Budgétaire & Fiscale RH", "desc": "Fiscalité RH, charges sociales et gestion budgétaire.", "active": false}, {"num": 27, "url": "/Domaine27_Reclamations_Contentieux_RH/", "label": "Réclamations & Contentieux RH", "desc": "Réclamations des salariés et gestion des litiges.", "active": false}, {"num": 28, "url": "/Domaine28_Mobilite_Carriere_Succession_RH/", "label": "Mobilité, Carrière & Succession", "desc": "Plans de carrière, promotion et gestion de succession.", "active": false}, {"num": 29, "url": "/Domaine29_Communication_Interne_Engagement/", "label": "Communication Interne & Engagement", "desc": "Engagement des collaborateurs et communication interne.", "active": false}, {"num": 30, "url": "/Domaine30_Expatrites_Mobilite_Internationale/", "label": "Expatriés & Mobilité Internationale", "desc": "Politiques d'expatriation et mobilité globale.", "active": false}, {"num": 31, "url": "/Domaine31_Retraites_Prevoyance_Transitions_Carriere/", "label": "Retraites, Prévoyance & Transitions de Carrière", "desc": "Départs en retraite, prévoyance et transitions de carrière.", "active": false}];
var grid = document.getElementById('grid');
grid.innerHTML = DOMAINS.map(function (d) {
  return '<a class="card' + (d.active ? ' actif' : '') + '" href="' + d.url + '">' +
    '<div class="top"><div class="num">D' + d.num + '</div><h3>' + d.label + '</h3></div>' +
    '<p>' + d.desc + '</p>' +
    '<div class="foot"><span class="st ' + (d.active ? 'ok">ACTIF' : 'warn">EN PRÉPARATION') + '</span>' +
    '<span class="go">' + (d.active ? 'Ouvrir →' : 'Voir →') + '</span></div></a>';
}).join('');
var q = document.getElementById('q');
q.addEventListener('input', function () {
  var v = q.value.trim().toLowerCase(), n = 0;
  var cards = grid.querySelectorAll('.card');
  for (var i = 0; i < cards.length; i++) {
    var hit = cards[i].textContent.toLowerCase().indexOf(v) !== -1;
    cards[i].style.display = hit ? '' : 'none';
    if (hit) n++;
  }
  document.getElementById('empty').style.display = n ? 'none' : 'block';
});
</script>
</body>
</html>
