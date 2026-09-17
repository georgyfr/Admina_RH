/* =====================================================================
ADMINA-RH — /parametres = LE CENTRE DE COMMANDE du Domaine 1.
   La page ne gère ni candidats ni offres : elle gère la CONFIGURATION qui détermine
   le comportement de toutes les autres pages. Chaque paramètre est un réglage
   sensible : l'interface rend VISIBLE l'impact d'un changement (pages affectées),
   distingue les valeurs MODIFIÉES des valeurs par défaut, permet la recherche
   instantanée, le regroupement par domaine fonctionnel, trace qui a changé quoi
   (journal), et offre une réinitialisation sûre PAR paramètre. Danger n°1 =
   un réglage incohérent (ex. essai CDI < essai CDD) → alertes de cohérence.
   Module généré par le canon W4 (moteur + config parametres).
   Additif-sur-natif : la page React native reste intacte.
   ===================================================================== */
(function () {
'use strict';
if (window.__ADMINA_PAR__) return; window.__ADMINA_PAR__ = { v: '1.0-w4' };
var CFG = {"lsData":"admina-parametres-data","lsUI":"admina-parametres-ui","lsSeuils":"admina-parametres-seuils","routeRe":/\/Domaine1_Recrutement_Candidats\/parametres\/?$/,"nameKey":"parametre","searchKeys":["parametre","valeur","categorie","description"],"seed":"[{id:1,parametre:\"Nom de l'entreprise\",valeur:\"HRC Cameroon\",categorie:\"Général\",description:\"Nom officiel affiché dans les documents\"},{id:2,parametre:\"Adresse\",valeur:\"Douala, Cameroun\",categorie:\"Général\",description:\"Siège social de l'entreprise\"},{id:3,parametre:\"Téléphone\",valeur:\"+237 2 33 42 00\",categorie:\"Général\",description:\"Numéro de contact principal\"},{id:4,parametre:\"Email RH\",valeur:\"rh@hrc-cameroon.com\",categorie:\"Notifications\",description:\"Adresse pour les notifications RH\"},{id:5,parametre:\"Durée période d'essai (CDI)\",valeur:\"3 mois\",categorie:\"Contrats\",description:\"Durée standard pour les contrats CDI\"},{id:6,parametre:\"Durée période d'essai (CDD)\",valeur:\"1 mois\",categorie:\"Contrats\",description:\"Durée standard pour les contrats CDD\"},{id:7,parametre:\"Salaire minimum\",valeur:\"36 270 FCFA\",categorie:\"Rémunération\",description:\"SMIG en vigueur au Cameroun\"},{id:8,parametre:\"Heures hebdomadaires\",valeur:\"40\",categorie:\"Rémunération\",description:\"Durée légale de travail hebdomadaire\"},{id:9,parametre:\"Taux CNPS employeur\",valeur:\"4.2%\",categorie:\"Charges\",description:\"Taux de cotisation patronale CNPS\"},{id:10,parametre:\"Taux CNPS employé\",valeur:\"2.8%\",categorie:\"Charges\",description:\"Taux de cotisation salariale CNPS\"}]","hero":{"kicker":"LE CENTRE DE COMMANDE DU DOMAINE 1","title":"Paramètres du Système — le pilotage de la configuration","subtitle":function (S) { var m = 0; S.data.forEach(function (x) { if (x.__mod) m++; }); return S.data.length + ' paramètres, ' + m + ' modifié(s), ' + (S.data.length ? Object.keys(S.data.reduce(function (a, x) { a[x.categorie] = 1; return a; }, {})).length : 0) + ' catégories — chaque réglage influe sur les autres pages : vérifiez l\'impact avant d\'enregistrer.'; }},"alerts":[{"icon":"✎","sev":"warn","count":function (S) { return S.data.filter(function (x) { return x.__mod; }).length; },"test":function (S) { return S.data.some(function (x) { return x.__mod; }); },"label":function (S, n) { return 'Paramètres modifiés — vérifiez l\'impact'; },"filterApply":function () { return { view: 'signature', filters: { etat: 'Modifié' } }; }},{"icon":"⚠","sev":"danger","count":function (S) { return incoherences(S).length; },"test":function (S, t) { return incoherences(S).length > 0; },"label":function () { return 'Réglages incohérents entre eux'; },"filterApply":function () { return { view: 'signature' }; }},{"icon":"∅","sev":"warn","count":function (S) { return S.data.filter(function (x) { return !String(x.valeur || '').trim() || String(x.valeur).trim() === '—'; }).length; },"test":function (S) { return S.data.some(function (x) { return !String(x.valeur || '').trim() || String(x.valeur).trim() === '—'; }); },"label":function () { return 'Paramètres critiques sans valeur'; },"filterApply":function () { return { filters: { etat: 'Vide' } }; }},{"icon":"№","sev":"ok","count":function (S) { return S.data.filter(function (x) { return /essai|cnps|salaire|heures/i.test(x.parametre); }).length; },"test":function () { return true; },"label":function () { return 'Réglages sensibles (essai, CNPS, salaire)'; },"filterApply":function () { return { filters: { categorie: 'Tous' }, view: 'signature' }; }},{"icon":"🕘","sev":"mut","count":function (S) { return modifs24h(); },"test":function (S, t) { return modifs24h() >= (t.seuilModifs || 5); },"label":function (S, n) { return 'Modifications récentes à relire'; },"filterApply":function () { return { view: 'signature' }; }}],"afterLoad":function (S) {
    try {
      var def = seedArr();
      S.data.forEach(function (x) { var d = def.filter(function (p) { return String(p.id) === String(x.id); })[0]; if (d) { x.__def = d.valeur; x.__mod = String(d.valeur) !== String(x.valeur); } else { x.__mod = true; } });
    } catch (e) { }
  },"kpis":[{"label":"PARAMÈTRES","calc":function (S) { return fmtN(S.data.length); },"sub":"réglages actifs"},{"label":"CATÉGORIES","calc":function (S) { return fmtN(Object.keys(S.data.reduce(function (a, x) { a[x.categorie] = 1; return a; }, {})).length); },"sub":"domaines fonctionnels"},{"label":"MODIFIÉS","calc":function (S) { return fmtN(S.data.filter(function (x) { return x.__mod; }).length); },"sub":"vs valeurs par défaut","filter":function () { return { filters: { etat: 'Modifié' } }; }},{"label":"CRITIQUES","calc":function (S) { return fmtN(S.data.filter(function (x) { return /essai|cnps|salaire|heures/i.test(x.parametre); }).length); },"sub":"essai · CNPS · salaire","filter":function () { return { filters: { categorie: 'Tous' }, view: 'signature' }; }},{"label":"CNPS TOTAL","calc":function (S) { var a = numVal(S, 'Taux CNPS employeur'), b = numVal(S, 'Taux CNPS employé'); return (a != null && b != null) ? pct(a + b, 1) : '—'; },"sub":"employeur + employé"},{"label":"ESSAI CDI","calc":function (S) { return esc(String(val(S, 'Durée période d\'essai (CDI)') || '—')); },"sub":"standard configuré","filter":function () { return { filters: { categorie: 'Contrats' } }; }}],"charts":[{"type":"donut","title":"Répartition par domaine fonctionnel","unit":"paramètres","calc":function (S) { var cols = ['#2e7d5b', '#b26a00', '#7a5ba8', '#2f6f9f', '#c05f33', '#4c8b6f']; var m = {}; S.data.forEach(function (x) { m[x.categorie] = (m[x.categorie] || 0) + 1; }); return Object.keys(m).map(function (k, i) { return { label: k, value: m[k], color: cols[i % cols.length], filter: JSON.stringify({ filters: { categorie: k } }) }; }); }},{"type":"bars","title":"Modifiés par catégorie","calc":function (S) { var m = {}; S.data.forEach(function (x) { if (x.__mod) m[x.categorie] = (m[x.categorie] || 0) + 1; }); return Object.keys(m).map(function (k) { return { label: k, value: m[k], color: '#b26a00', filter: JSON.stringify({ filters: { categorie: k, etat: 'Modifié' } }) }; }); }}],"filters":[{"id":"categorie","label":"Catégorie","options":function (S) { return ['Tous'].concat(Object.keys(S.data.reduce(function (a, x) { a[x.categorie] = 1; return a; }, {}))); }},{"id":"etat","label":"État","options":function () { return ['Tous', 'Modifié', 'Par défaut', 'Vide']; },"match":function (x, v) { if (v === 'Modifié') return !!x.__mod; if (v === 'Vide') return !String(x.valeur || '').trim() || String(x.valeur).trim() === '—'; return !x.__mod && String(x.valeur || '').trim() && String(x.valeur).trim() !== '—'; }}],"columns":[{"key":"parametre","label":"Paramètre","render":function (x) { return '<b>' + esc(x.parametre) + '</b>' + (x.__mod ? ' <span class="adm-badge warn">modifié</span>' : ''); }},{"key":"valeur","label":"Valeur","render":function (x) { return '<span class="adm-badge mut">' + esc(x.valeur || '—') + '</span>'; }},{"key":"categorie","label":"Catégorie"},{"key":"description","label":"Description","csv":true}],"cardFn":function (x, S) {
    return '<span class="adm-badge mut">' + esc(x.categorie) + '</span>' +
      '<h4 style="margin:8px 0 2px;font-size:15px">' + esc(x.parametre) + (x.__mod ? ' <span class="adm-badge warn">modifié</span>' : '') + '</h4>' +
      '<div style="font-size:18px;font-weight:800;color:var(--aw-acc)">' + esc(x.valeur || '—') + '</div>' +
      '<div style="font-size:12px;color:var(--aw-mut);margin-top:4px">' + esc(x.description || '') + '</div>';
  },"signature":{"short":"Réglages","title":"Le tableau de bord des réglages","render":function (S, rows, h) {
      var cats = {}; rows.forEach(function (x) { (cats[x.categorie] = cats[x.categorie] || []).push(x); });
      var impact = { 'Général': 'Toutes les pages (documents, en-têtes)', 'Notifications': '/demandes · /offres · alertes e-mail', 'Contrats': '/types-de-contrats · /periode-dessai · /suivi-contrats', 'Rémunération': '/offres · /kpis-objectifs-rh', 'Charges': '/suivi-contrats · budget' };
      var out = '<h4 class="adm-sig-t">Le tableau de bord des réglages</h4><p class="adm-sig-s">Vue par domaine fonctionnel : valeur courante, état (modifié / par défaut), impact sur les autres pages, réinitialisation par paramètre.</p>';
      Object.keys(cats).sort().forEach(function (c) {
        out += '<div style="margin:0 0 16px"><div style="font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--aw-mut);margin-bottom:6px">' + h.esc(c) + ' — impact : ' + h.esc(impact[c] || 'selon usage') + '</div><table style="width:100%;border-collapse:collapse">';
        cats[c].forEach(function (x) {
          out += '<tr><td style="padding:7px 8px;border-bottom:1px dashed var(--aw-line)"><b>' + h.esc(x.parametre) + '</b><br><span style="font-size:11px;color:var(--aw-mut)">' + h.esc(x.description || '') + '</span></td>' +
            '<td style="padding:7px 8px;border-bottom:1px dashed var(--aw-line);text-align:right"><span style="font-size:15px;font-weight:800;color:var(--aw-acc)">' + h.esc(x.valeur || '—') + '</span> ' + (x.__mod ? '<span class="adm-badge warn">modifié</span>' : '<span class="adm-badge mut">défaut</span>') +
            ' <button type="button" class="adm-ico" data-act="reset-one" data-id="' + h.esc(x.id) + '" title="Réinitialiser ce paramètre à sa valeur par défaut">↺</button></td></tr>';
        });
        out += '</table></div>';
      });
      var inc = incoherences(S);
      if (inc.length) out += '<div class="adm-badge bad" style="display:inline-block;margin-top:4px">Incohérences détectées : ' + inc.map(function (i) { return h.esc(i); }).join(' · ') + '</div>';
      return out;
    }},"dialog":{"labelNew":"Paramètre","labelOpen":"Paramètre","title":"paramètre du système","fields":[{"key":"parametre","label":"Nom du paramètre","required":true,"validate":function (v, a, S, item) { var d = S.data.filter(function (x) { return norm(x.parametre) === norm(v) && (!item || String(x.id) !== String(item.id)); }); return d.length ? 'Ce paramètre existe déjà' : ''; }},{"key":"valeur","label":"Valeur","required":true},{"key":"categorie","label":"Catégorie","type":"select","options":["Général","Notifications","Contrats","Rémunération","Charges"]},{"key":"description","label":"Description"}],"map":function (a, item) { var o = item || {}; o.parametre = a.parametre; o.valeur = a.valeur; o.categorie = a.categorie || 'Général'; o.description = a.description || ''; return o; }},"drawer":function (x, S, h) {
    var j = (function () { try { return JSON.parse(localStorage.getItem('admina_journal') || '[]'); } catch (e) { return []; } })().filter(function (e) { return (e.detail || '').indexOf(String(x.parametre)) >= 0; }).slice(-8);
    return '<h4>' + h.esc(x.parametre) + '</h4><p>' + h.esc(x.description || '') + '</p>' +
      '<h4>Valeur</h4><table><tr><td>Actuelle</td><td>' + h.esc(x.valeur || '—') + '</td></tr><tr><td>Par défaut</td><td>' + h.esc(x.__def || x.valeur || '—') + '</td></tr><tr><td>Catégorie</td><td>' + h.esc(x.categorie) + '</td></tr><tr><td>État</td><td>' + (x.__mod ? 'modifié' : 'défaut') + '</td></tr></table>' +
      '<h4>Impact</h4><p>' + h.esc(impactOf(x.categorie)) + '</p>' +
      '<h4>Journal (dernières actions)</h4>' + (j.length ? '<table>' + j.map(function (e) { return '<tr><td>' + h.esc(new Date(e.time).toLocaleString('fr-FR')) + '</td><td>' + h.esc(e.action) + '</td></tr>'; }).join('') + '</table>' : '<p style="color:var(--aw-mut)">Aucune action enregistrée.</p>');
  },"seuils":[{"id":"essaiCDIMax","label":"Essai CDI maximum (mois)","min":1,"max":24,"def":3,"unit":" mois"},{"id":"essaiCDDMax","label":"Essai CDD maximum (mois)","min":0,"max":12,"def":1,"unit":" mois"},{"id":"seuilModifs","label":"Alerte à partir de N modifications (24 h)","min":1,"max":20,"def":5}],"dupFn":function (x, nid) { var o = JSON.parse(JSON.stringify(x)); o.id = nid; o.parametre = x.parametre + ' (copie)'; o.__mod = true; return o; },"delConfirm":function (items) { return 'Supprimer <b>' + items.length + '</b> paramètre(s) ? Les pages concernées perdront ces réglages. Action journalisée.'; },"resetOne":function (x) { var o = {}; o[x.id] = x; return o; },"page":"parametres","apiName":"__ADMINA_PAR_API__","uiName":"__ADMINA_PAR_UI__","pre":"apr","dataKey":"parametres"};
/* ===== helpers spécifiques (injectés par le générateur W4) ===== */
function val(S, name) { var x = S.data.filter(function (p) { return p.parametre === name; })[0]; return x ? x.valeur : null; }
function numVal(S, name) { var v = val(S, name); if (v == null) return null; var n = parseFloat(String(v).replace(',', '.')); return isNaN(n) ? null : n; }
function modifs24h() { try { var j = JSON.parse(localStorage.getItem('admina_journal') || '[]'); var d = Date.now() - 86400000; return j.filter(function (e) { return new Date(e.time).getTime() > d; }).length; } catch (e) { return 0; } }
function incoherences(S) {
  var out = [];
  var cdi = numVal(S, 'Durée période d\'essai (CDI)') != null ? parseFloat(String(val(S, 'Durée période d\'essai (CDI)'))) : null;
  var cdd = numVal(S, 'Durée période d\'essai (CDD)') != null ? parseFloat(String(val(S, 'Durée période d\'essai (CDD)'))) : null;
  var cdiMax = (S.seuils && S.seuils.essaiCDIMax) || 3, cddMax = (S.seuils && S.seuils.essaiCDDMax) || 1;
  if (cdi != null && cdd != null && cdi <= cdd) out.push('essai CDI ≤ essai CDD');
  if (cdi != null && cdi > cdiMax) out.push('essai CDI > ' + cdiMax + ' mois');
  if (cdd != null && cdd > cddMax) out.push('essai CDD > ' + cddMax + ' mois');
  var h = numVal(S, 'Heures hebdomadaires');
  if (h != null && (h < 35 || h > 60)) out.push('heures hebdo hors plage légale');
  var ce = numVal(S, 'Taux CNPS employeur'), csa = numVal(S, 'Taux CNPS employé');
  if (ce != null && (ce < 0 || ce > 25)) out.push('taux CNPS employeur suspect');
  if (csa != null && (csa < 0 || csa > 25)) out.push('taux CNPS employé suspect');
  var smig = numVal(S, 'Salaire minimum');
  if (smig != null && smig < 36270) out.push('salaire minimum < SMIG');
  return out;
}
function impactOf(cat) {
  return { 'Général': 'Toutes les pages (documents, en-têtes, exports)', 'Notifications': '/demandes · /offres · alertes e-mail', 'Contrats': '/types-de-contrats · /periode-dessai · /suivi-contrats', 'Rémunération': '/offres · /kpis-objectifs-rh', 'Charges': '/suivi-contrats · suivi budgétaire' }[cat] || 'selon usage de la catégorie';
}
function fillPct(x) { return Math.round(Number(x.nbEmployes || 0) / Math.max(1, Number(x.effectifCible || 1)) * 100); }
function SEUILS() { try { return JSON.parse(localStorage.getItem('admina-departements-seuils') || '{}'); } catch (e) { return {}; } }
function doublonsDep(S) {
  var m = {}; S.data.forEach(function (x) { var k = norm(x.nom); (m[k] = m[k] || []).push(x.nom); });
  return Object.keys(m).filter(function (k) { return m[k].length > 1; }).map(function (k) { return m[k][0]; });
}
function cardDep(x, p, h) {
  var cls = p >= 95 && p <= 100 ? 'ok' : (p < 50 ? 'bad' : 'warn');
  return '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><b style="font-size:15px">' + h.esc(x.nom) + '</b><span class="adm-badge ' + (p > 100 ? 'bad' : cls) + '">' + h.pct(p, 0) + '</span></div>' +
    '<div style="font-size:12px;color:var(--aw-mut);margin:4px 0 8px">' + h.esc(x.responsable || 'Responsable à nommer') + ' · ' + h.esc(x.localisation || '') + '</div>' +
    '<span class="adm-gauge"><i class="' + (p > 100 ? 'bad' : cls) + '" style="width:' + Math.min(100, p) + '%"></i></span>' +
    '<div style="display:flex;justify-content:space-between;font-size:12px;margin-top:6px"><span>' + h.fmtN(x.nbEmployes) + ' / ' + h.fmtN(x.effectifCible) + ' employés</span></div>';
}
function t4Realise(x) { var m = x.monthly || []; var v = m.slice(9); var f = v.filter(function (a) { return a != null && !isNaN(a); }); return f.length ? f.reduce(function (p, c) { return p + c; }, 0) / f.length : null; }
function ecartPct(x) { var r = t4Realise(x), c = Number(x.cibleT4); if (r == null || !c) return null; var ec = (r - c) / Math.abs(c) * 100; return x.inverse ? -ec : ec; }
function ragOf(x, t) { var ec = ecartPct(x); if (ec == null) return 'ATT'; var d = (t && t.drift) || 10; return ec >= d ? 'OK' : (ec <= -d ? 'NOK' : 'ATT'); }
function stagnation(x) {
  var m = x.monthly || []; if (m.length < 3) return false;
  var last = m.slice(-3), f = last.filter(function (v) { return v != null; });
  if (f.length < 3) return false;
  var base = f[0]; if (!base) return false;
  var maxVar = Math.max.apply(null, f.map(function (v) { return Math.abs(v - base) / Math.abs(base) * 100; }));
  var seuil = SEUILS_K().stagnation; if (seuil == null) seuil = 1;
  return maxVar < seuil;
}
function SEUILS_K() { try { return JSON.parse(localStorage.getItem('admina-kpis-seuils') || '{}'); } catch (e) { return {}; } }
function sparkline(x) {
  var m = (x.monthly || []).filter(function (v) { return v != null; });
  if (m.length < 2) return '';
  var min = Math.min.apply(null, m), max = Math.max.apply(null, m), rg = (max - min) || 1;
  var pts = m.map(function (v, i) { return (i * (110 / (m.length - 1)) + 2).toFixed(1) + ',' + (26 - ((v - min) / rg * 22)).toFixed(1); }).join(' ');
  return '<svg viewBox="0 0 114 30" style="width:100%;height:30px;margin-top:6px"><polyline points="' + pts + '" fill="none" stroke="var(--aw-acc)" stroke-width="2"/></svg>';
}
function cardKpi(x, S, h) {
  var r = ragOf(x, S.seuils), ec = ecartPct(x), t4 = t4Realise(x);
  return '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><b style="font-size:14px">' + h.esc(x.kpi) + '</b><span class="adm-badge ' + (r === 'OK' ? 'ok' : r === 'NOK' ? 'bad' : 'warn') + '">' + (r === 'OK' ? 'Atteint' : r === 'NOK' ? 'Dérive' : 'Surveiller') + '</span></div>' +
    '<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--aw-mut);margin:6px 0 4px"><span>Cible T4 : <b>' + h.fmtN(x.cibleT4, 1) + ' ' + h.esc(x.unit) + '</b></span><span>Réalisé : <b>' + h.esc(t4 == null ? '—' : h.fmtN(t4, 1)) + '</b></span></div>' +
    '<span class="adm-gauge"><i class="' + (ec >= 0 ? '' : 'bad') + '" style="width:' + Math.max(3, Math.min(100, Math.abs(ec || 0))) + '%"></i></span>';
}
function roiConv(x) { return Number(x.nbCandidats) ? Math.round(Number(x.nbEmbauches || 0) / Number(x.nbCandidats) * 1000) / 10 : null; }
function roiCpe(x) { return Number(x.nbEmbauches) ? Math.round(Number(x.coutTotal || 0) / Number(x.nbEmbauches)) : null; }
function SEUILS_R() { try { return JSON.parse(localStorage.getItem('admina-sourcesroi-seuils') || '{}'); } catch (e) { return {}; } }
function bestRoi(S) { return S.data.filter(function (x) { return Number(x.nbCandidats) >= 10; }).sort(function (a, b) { return (roiConv(b) || 0) - (roiConv(a) || 0); })[0] || null; }
function bestRoiB(x) { return false; }
function verdict(x) {
  var c = roiConv(x), cpe = roiCpe(x);
  if (!Number(x.nbCandidats)) return 'Canal muet : aucun candidat apporté — à relancer ou à fermer.';
  if (Number(x.coutTotal || 0) > 0 && !Number(x.nbEmbauches)) return 'Coût sans résultat : ' + fmtF(x.coutTotal) + ' engagés, 0 embauche — arbitrage urgent.';
  if (c != null && c >= 12 && (cpe == null || cpe <= 100000)) return 'Canal efficient : bonne conversion (' + pct(c, 1) + ') et coût maîtrisé — à développer.';
  if (c != null && c < 8) return 'Conversion faible (' + pct(c, 1) + ') — resserrer le ciblage avant de renouveler le budget.';
  return 'Canal correct — à surveiller sur la tendance du trimestre.';
}
function cabCpr(x) { return Number(x.recrutements) ? Math.round(Number(x.coutTotal || 0) / Number(x.recrutements)) : null; }
function echeanceJours(x) { if (x.contratEnCours !== 'Oui' || !x.dateFinContrat) return null; var m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(x.dateFinContrat)); if (!m) return null; return Math.round((new Date(+m[3], +m[2] - 1, +m[1]).getTime() - Date.now()) / 86400000); }
function SEUILS_C() { try { return JSON.parse(localStorage.getItem('admina-cabinets-seuils') || '{}'); } catch (e) { return {}; } }
function doublonsCab(S) {
  var m = {}; S.data.forEach(function (x) { var k = norm(x.cabinet) + '|' + norm(x.email); (m[k] = m[k] || []).push(x.cabinet); });
  var seen = {}, out = [];
  Object.keys(m).forEach(function (k) { if (m[k].length > 1 && m[k][0]) out.push(m[k][0]); });
  return out;
}
function cardCab(x, h) {
  var t = Number(x.tauxReussite || 0), j = echeanceJours(x);
  return '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><b style="font-size:14px">' + h.esc(x.cabinet) + '</b><span class="adm-badge ' + (x.evaluation === 'Excellent' || x.evaluation === 'Bon' ? 'ok' : 'warn') + '">' + h.esc(x.evaluation || '—') + '</span></div>' +
    '<div style="font-size:12px;color:var(--aw-mut);margin:4px 0 8px">' + h.esc(x.specialite || '') + ' · ' + h.esc(x.ville || '') + '</div>' +
    '<span class="adm-gauge"><i class="' + (t >= 25 ? '' : t >= 20 ? 'warn' : 'bad') + '" style="width:' + Math.min(100, t * 2) + '%"></i></span>' +
    '<div style="display:flex;justify-content:space-between;font-size:12px;margin-top:6px"><span>' + h.fmtN(x.recrutements) + ' recrutements</span><span>' + h.pct(t, 1) + '</span></div>' +
    '<div style="display:flex;justify-content:space-between;font-size:12px;margin-top:4px"><span>' + h.fmtF(x.coutTotal) + '</span>' + (x.contratEnCours === 'Oui' ? (j != null && j < 60 ? '<span class="adm-badge warn">échéance ' + j + ' j</span>' : '<span class="adm-badge ok">en cours</span>') : '<span class="adm-badge mut">terminé</span>') + '</div>';
}
/* ================= MOTEUR CANON W4 (généré — consomme CFG) ================= */
var D = document, W = window;
function $(s, r) { return (r || D).querySelector(s); }
function $$(s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
function fmtN(n, d) { if (n == null || isNaN(n)) return '—'; return Number(n).toLocaleString('fr-FR', { maximumFractionDigits: d == null ? 0 : d }); }
function fmtF(n) { if (n == null || isNaN(n)) return '—'; return fmtN(Math.round(n)) + ' FCFA'; }
function pct(n, d) { if (n == null || isNaN(n) || !isFinite(n)) return '—'; return fmtN(n, d == null ? 1 : d) + ' %'; }
function todayISO() { var t = new Date(); return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0'); }
function nowISO() { return new Date().toISOString(); }
function uidMax(arr) { var m = 0; (arr || []).forEach(function (x) { var n = Number(x && x.id); if (n > m) m = n; }); return m + 1; }
function debounce(fn, ms) { var t; return function () { var a = arguments, s = this; clearTimeout(t); t = setTimeout(function () { fn.apply(s, a); }, ms || 250); }; }

/* ---------------- état ---------------- */
var S = { data: [], native: false, ui: { view: 'table', q: '', filters: {}, sel: {}, drawer: null, dialog: null, sort: { key: null, dir: 1 } }, seuils: {}, journal: [] };
var BRIDGE = { unsub: null, last: '' };

function lsGet(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }

function journal(action, detail) {
  var role = 'Manager RH';
  try { if (W.__ADMINA_AUDIT__ && typeof W.__ADMINA_AUDIT__.log === 'function') { W.__ADMINA_AUDIT__.log(action, detail, role); } } catch (e) { }
  try {
    var arr = lsGet('admina_journal', []); if (!Array.isArray(arr)) arr = [];
    arr.push({ time: nowISO(), action: action, detail: detail, role: role });
    lsSet('admina_journal', arr.slice(-400));
  } catch (e) { }
  renderAlerts();
}

/* ---------------- données : pont natif + LS ---------------- */
function apiObj() { return W[CFG.apiName] || null; }

function dk() { return CFG.dataKey || CFG.page; }

function loadData() {
  var api = apiObj(), got = null;
  if (CFG.dataKey && api && typeof api.getData === 'function') {
    try { var d = api.getData(); if (d && d[CFG.dataKey]) { got = d[CFG.dataKey]; S.native = true; } } catch (e) { }
  }
  if (got === null) {
    var ls = lsGet(CFG.lsData, null);
    got = (ls && Array.isArray(ls[dk()])) ? ls[dk()] : (typeof CFG.seed === 'function' ? CFG.seed() : CFG.seed);
    S.native = false;
  }
  if (typeof got === 'string') { try { got = (new Function('return (' + got + ')'))(); } catch (e) { got = []; } }
  S.data = (got || []).map(function (x) { var o = {}; for (var k in x) o[k] = x[k]; return o; });
  S.seuils = lsGet(CFG.lsSeuils, null) || (function () { var s = {}; (CFG.seuils || []).forEach(function (x) { s[x.id] = x.def; }); return s; })();
  var ui = lsGet(CFG.lsUI, null); if (ui && typeof ui === 'object') S.ui.view = ui.view || 'table';
  if (typeof CFG.afterLoad === 'function') { try { CFG.afterLoad(S); } catch (e) { } }
}
function seedArr() { var s = typeof CFG.seed === 'function' ? CFG.seed() : (typeof CFG.seed === 'string' ? (function () { try { return (new Function('return (' + CFG.seed + ')'))(); } catch (e) { return []; } })() : CFG.seed); return s || []; }

function persistData() {
  var o = {}; o[dk()] = S.data; lsSet(CFG.lsData, o);
  var api = apiObj();
  if (api && typeof api.setData === 'function') { try { api.setData(o); } catch (e) { } }
}

function bridge() {
  var api = apiObj();
  if (api && typeof api.subscribe === 'function' && !BRIDGE.unsub) {
    try { BRIDGE.unsub = api.subscribe(function () { setTimeout(function () { loadData(); renderAll(); }, 30); }); } catch (e) { }
  }
}
setInterval(function () {
  if (!isRoute()) return;
  bridge();
  var api = apiObj();
  if (CFG.dataKey && api && typeof api.getData === 'function') {
    try { var d = api.getData()[CFG.dataKey] || []; var sig = JSON.stringify(d); if (sig !== BRIDGE.last && BRIDGE.last !== '') { S.data = d.map(function (x) { var o = {}; for (var k in x) o[k] = x[k]; return o; }); renderAll(); } BRIDGE.last = sig; } catch (e) { }
  }
}, 1200);

/* ---------------- routage SPA ---------------- */
var _ps = history.pushState, _rs = history.replaceState;
history.pushState = function () { var r = _ps.apply(this, arguments); setTimeout(onRoute, 20); return r; };
history.replaceState = function () { var r = _rs.apply(this, arguments); setTimeout(onRoute, 20); return r; };
addEventListener('popstate', function () { setTimeout(onRoute, 20); });

function isRoute() { return CFG.routeRe.test(location.pathname); }
var MOUNTED = false;
function onRoute() {
  var on = isRoute();
  var el = $('#admina-' + CFG.pre + '-wrap');
  if (el) el.style.display = on ? '' : 'none';
  if (on && !MOUNTED) { MOUNTED = true; loadData(); waitPage(function (root) { mount(root); }); }
  else if (on && MOUNTED) { loadData(); renderAll(); }
}

/* ---------------- attach résilient ---------------- */
function waitPage(cb, n) {
  n = n || 0;
  if (!isRoute()) return;
  var root = $('main') || $('#root') || D.body;
  var cont = root.querySelector('.MuiContainer-root') || root;
  if (cont && (cont.children.length >= 2 || n > 8)) { cb(cont); return; }
  if (n >= 30) { cb(cont || D.body); return; }
  setTimeout(function () { waitPage(cb, n + 1); }, 300);
}

/* ---------------- CSS ---------------- */
function injectCSS() {
  if ($('#admina-' + CFG.pre + '-css')) return;
  var l = D.createElement('link'); l.id = 'admina-' + CFG.pre + '-css'; l.rel = 'stylesheet'; l.href = '/assets/admina-' + CFG.page + '.css';
  D.head.appendChild(l);
}

/* ---------------- calculs dérivés ---------------- */
function filtered() {
  var q = norm(S.ui.q);
  var out = S.data.filter(function (x) {
    if (q) {
      var hit = false;
      (CFG.searchKeys || []).forEach(function (k) { if (norm(x[k]).indexOf(q) >= 0) hit = true; });
      if (!hit) return false;
    }
    for (var f in S.ui.filters) {
      var val = S.ui.filters[f];
      if (val && val !== 'Tous') {
        var def = (CFG.filters || []).filter(function (d) { return d.id === f; })[0];
        if (def && def.match && !def.match(x, val)) return false;
        else if (def && !def.match && String(x[f]) !== String(val)) return false;
      }
    }
    return true;
  });
  if (S.ui.sort.key) {
    var col = (CFG.columns || []).filter(function (c) { return c.key === S.ui.sort.key; })[0];
    out.sort(function (a, b) {
      var va = a[S.ui.sort.key], vb = b[S.ui.sort.key];
      if (col && col.sortVal) { va = col.sortVal(a); vb = col.sortVal(b); }
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * S.ui.sort.dir;
      return String(va == null ? '' : va).localeCompare(String(vb == null ? '' : vb), 'fr') * S.ui.sort.dir;
    });
  }
  return out;
}

/* ---------------- rendu ---------------- */
function mount(root) {
  injectCSS();
  var wrap = D.createElement('section');
  wrap.id = 'admina-' + CFG.pre + '-wrap';
  wrap.className = 'adm-w admina-' + CFG.pre;
  var anchor = null;
  var kids = root.children;
  for (var i = 0; i < Math.min(kids.length, 3); i++) {
    if (kids[i] && kids[i].querySelector && kids[i].querySelector('h5,h4')) { anchor = kids[i]; break; }
  }
  if (anchor && anchor.nextSibling) root.insertBefore(wrap, anchor.nextSibling);
  else if (anchor) root.insertBefore(wrap, anchor.nextSibling);
  else root.insertBefore(wrap, root.firstChild);

  W[CFG.uiName] = W[CFG.uiName] || {};
  W[CFG.uiName].version = '1.0-w4';
  W[CFG.uiName].getPage = function () { return S; };
  W[CFG.uiName].refresh = function () { loadData(); renderAll(); };
  W[CFG.uiName].openDialog = function (item) { openDialog(item || null); };

  wrap.innerHTML =
    '<header class="adm-hero" id="' + CFG.pre + '-hero"></header>' +
    '<div class="adm-alerts" id="' + CFG.pre + '-alerts" aria-live="polite"></div>' +
    '<div class="adm-kpis" id="' + CFG.pre + '-kpis"></div>' +
    '<div class="adm-charts" id="' + CFG.pre + '-charts"></div>' +
    '<div class="adm-toolbar" id="' + CFG.pre + '-toolbar"></div>' +
    '<div class="adm-bulk" id="' + CFG.pre + '-bulk" hidden></div>' +
    '<div class="adm-view" id="' + CFG.pre + '-view"></div>' +
    '<div class="adm-hint">Astuce : raccourcis N (nouveau), E (export), / (recherche), T (vue signature), ? (aide) — bouton burger sur mobile.</div>';

  bindEvents(wrap);
  renderAll();
  bridge();
  journalRead();
}

function renderAll() {
  if (!isRoute()) return;
  var wrap = $('#admina-' + CFG.pre + '-wrap'); if (!wrap) return;
  renderHero(); renderAlerts(); renderKpis(); renderCharts(); renderToolbar(); renderBulk(); renderView();
}

/* héro */
function renderHero() {
  var el = $('#' + CFG.pre + '-hero'); if (!el) return;
  var h = CFG.hero;
  var alerts = (CFG.alerts || []).filter(function (a) { return a.test(S, S.seuils); });
  el.innerHTML =
    '<div class="adm-hero-main">' +
    '<div class="adm-hero-kicker">' + esc(h.kicker) + '</div>' +
    '<h3 class="adm-hero-title">' + esc(h.title) + '</h3>' +
    '<p class="adm-hero-sub">' + h.subtitle(S) + '</p>' +
    '</div>' +
    '<div class="adm-hero-side">' +
    '<button type="button" class="adm-chip" data-act="csv" title="Export CSV complet (E)">⬇ CSV</button>' +
    '<button type="button" class="adm-chip" data-act="help" title="Aide et raccourcis (?)">? Aide</button>' +
    '</div>';
}

/* alertes AAA */
function renderAlerts() {
  var el = $('#' + CFG.pre + '-alerts'); if (!el) return;
  var list = (CFG.alerts || []).map(function (a, i) {
    var n = 0; try { n = a.count ? a.count(S, S.seuils) : 0; } catch (e) { }
    var on = a.test(S, S.seuils);
    return '<button type="button" class="adm-alert adm-' + (a.sev || 'warn') + (on ? '' : ' adm-muted') + '" data-alert="' + i + '"' + (on ? '' : ' disabled') + ' aria-label="' + esc(typeof a.label === 'function' ? a.label(S, n) : a.label) + '">' +
      '<span class="adm-alert-ic">' + a.icon + '</span><span class="adm-alert-tx">' + (typeof a.label === 'function' ? a.label(S, n) : a.label) + '</span>' +
      (on ? '<span class="adm-alert-n">' + n + '</span>' : '') + '</button>';
  }).join('');
  el.innerHTML = list;
}

/* KPI */
function renderKpis() {
  var el = $('#' + CFG.pre + '-kpis'); if (!el) return;
  el.innerHTML = (CFG.kpis || []).map(function (k, i) {
    var v; try { v = k.calc(S); } catch (e) { v = '—'; }
    return '<button type="button" class="adm-kpi' + (k.filter ? ' adm-click' : '') + '" data-kpi="' + i + '"' + (k.filter ? '' : ' disabled') + '>' +
      '<span class="adm-kpi-l">' + esc(k.label) + '</span><span class="adm-kpi-v">' + v + '</span><span class="adm-kpi-s">' + (typeof k.sub === 'function' ? k.sub(S) : (k.sub || '')) + '</span></button>';
  }).join('');
}

/* graphiques SVG */
function renderCharts() {
  var el = $('#' + CFG.pre + '-charts'); if (!el) return;
  el.innerHTML = (CFG.charts || []).map(function (c) {
    var items; try { items = c.calc(S) || []; } catch (e) { items = []; }
    if (c.type === 'donut') return donutSVG(c, items);
    if (c.type === 'bars') return barsSVG(c, items);
    return '';
  }).join('');
}
function donutSVG(c, items) {
  var tot = 0; items.forEach(function (x) { tot += Math.max(0, x.value || 0); });
  if (!tot) return '<div class="adm-chart adm-empty">' + esc(c.title) + '<div class="adm-empty-tx">Aucune donnée</div></div>';
  var R = 54, CX = 70, CY = 70, CIRC = 2 * Math.PI * R, off = 0;
  var segs = items.map(function (x) {
    var frac = Math.max(0, x.value || 0) / tot, len = frac * CIRC;
    var s = '<circle class="adm-seg adm-click" data-filter="' + esc(x.filter || '') + '" cx="' + CX + '" cy="' + CY + '" r="' + R + '" fill="none" stroke="' + (x.color || '#4c8b6f') + '" stroke-width="26" stroke-dasharray="' + len.toFixed(1) + ' ' + (CIRC - len).toFixed(1) + '" stroke-dashoffset="' + (-off).toFixed(1) + '"><title>' + esc(x.label) + ' : ' + fmtN(x.value) + '</title></circle>';
    off += len; return s;
  }).join('');
  var leg = items.map(function (x) { return '<li class="adm-click" data-filter="' + esc(x.filter || '') + '"><span class="adm-dot" style="background:' + (x.color || '#4c8b6f') + '"></span>' + esc(x.label) + ' <b>' + fmtN(x.value) + '</b></li>'; }).join('');
  return '<div class="adm-chart"><div class="adm-chart-t">' + esc(c.title) + '</div><div class="adm-chart-body"><svg viewBox="0 0 140 140" role="img" aria-label="' + esc(c.title) + '">' + segs + '<text x="70" y="66" text-anchor="middle" class="adm-donut-big">' + fmtN(tot) + '</text><text x="70" y="84" text-anchor="middle" class="adm-donut-sm">' + esc(c.unit || '') + '</text></svg><ul class="adm-legend">' + leg + '</ul></div></div>';
}
function barsSVG(c, items) {
  var max = 0; items.forEach(function (x) { max = Math.max(max, x.value || 0); });
  if (!max) return '<div class="adm-chart adm-empty">' + esc(c.title) + '<div class="adm-empty-tx">Aucune donnée</div></div>';
  var slot = 34; items.forEach(function (x) { slot = Math.max(slot, Math.min(String(x.label).length, 9) * 5 + 8); });
  var bars = items.map(function (x, i) {
    var h = Math.max(2, Math.round((x.value || 0) / max * 88));
    return '<g class="adm-click" data-filter="' + esc(x.filter || '') + '"><rect x="' + (12 + i * slot) + '" y="' + (116 - h) + '" width="24" height="' + h + '" rx="3" fill="' + (x.color || '#4c8b6f') + '"><title>' + esc(x.label) + ' : ' + fmtN(x.value) + '</title></rect>' +
      '<text x="' + (24 + i * slot) + '" y="128" text-anchor="middle" class="adm-bar-lb">' + esc(String(x.label).length > 9 ? String(x.label).slice(0, 8) + '…' : x.label) + '</text></g>';
  }).join('');
  return '<div class="adm-chart"><div class="adm-chart-t">' + esc(c.title) + '</div><svg viewBox="0 0 ' + Math.max(160, 24 + items.length * slot) + ' 138" role="img" aria-label="' + esc(c.title) + '">' + bars + '</svg></div>';
}

/* toolbar */
function renderToolbar() {
  var el = $('#' + CFG.pre + '-toolbar'); if (!el) return;
  var fl = (CFG.filters || []).map(function (f) {
    var opts; try { opts = f.options(S); } catch (e) { opts = ['Tous']; }
    var cur = S.ui.filters[f.id] || 'Tous';
    if (opts.indexOf(cur) < 0) { S.ui.filters[f.id] = 'Tous'; cur = 'Tous'; }
    return '<label class="adm-f"><span>' + esc(f.label) + '</span><select data-filter="' + f.id + '">' + opts.map(function (o) { return '<option' + (o === cur ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') + '</select></label>';
  }).join('');
  el.innerHTML =
    '<div class="adm-search"><input type="search" id="' + CFG.pre + '-q" placeholder="Rechercher… ( / )" value="' + esc(S.ui.q) + '" aria-label="Recherche"></div>' +
    fl +
    '<div class="adm-views" role="group" aria-label="Vue">' +
    '<button type="button" class="adm-vbtn' + (S.ui.view === 'table' ? ' on' : '') + '" data-view="table" title="Tableau (C)">▦ Table</button>' +
    '<button type="button" class="adm-vbtn' + (S.ui.view === 'cards' ? ' on' : '') + '" data-view="cards" title="Cartes (P)">▤ Cartes</button>' +
    '<button type="button" class="adm-vbtn' + (S.ui.view === 'signature' ? ' on' : '') + '" data-view="signature" title="' + esc(CFG.signature.title) + ' (T)">★ ' + esc(CFG.signature.short || 'Signature') + '</button>' +
    '</div>' +
    '<div class="adm-actions">' +
    '<button type="button" class="adm-btn adm-ghost" data-act="seuils" title="Seuils (K)">⚙ Seuils</button>' +
    '<button type="button" class="adm-btn adm-ghost" data-act="reset" title="Réinitialiser filtres">↺ Réinitialiser</button>' +
    '<button type="button" class="adm-btn adm-primary" data-act="new" title="Nouveau (N)">+ ' + esc(CFG.dialog.labelNew || 'Nouveau') + '</button>' +
    '</div>';
}

/* barre d'actions groupées */
function selCount() { var n = 0; for (var k in S.ui.sel) if (S.ui.sel[k]) n++; return n; }
function renderBulk() {
  var el = $('#' + CFG.pre + '-bulk'); if (!el) return;
  var n = selCount();
  el.hidden = n === 0;
  if (n) el.innerHTML = '<b>' + n + '</b> sélection(s)' +
    '<button type="button" class="adm-btn adm-ghost" data-act="dup-sel">⧉ Dupliquer</button>' +
    '<button type="button" class="adm-btn adm-danger" data-act="del-sel">🗑 Supprimer</button>' +
    '<button type="button" class="adm-btn adm-ghost" data-act="clear-sel">Annuler</button>';
}

/* vue principale */
function renderView() {
  var el = $('#' + CFG.pre + '-view'); if (!el) return;
  var rows = filtered();
  if (S.ui.view === 'cards') el.innerHTML = cardsHTML(rows);
  else if (S.ui.view === 'signature') el.innerHTML = signatureHTML(rows);
  else el.innerHTML = tableHTML(rows);
}

function tableHTML(rows) {
  var cols = CFG.columns || [];
  var head = '<tr><th class="adm-ck"><input type="checkbox" id="' + CFG.pre + '-all" aria-label="Tout sélectionner"></th>' +
    cols.map(function (c) {
      var on = S.ui.sort.key === c.key;
      return '<th' + (c.sortable === false ? '' : ' role="button" tabindex="0" class="adm-sort" data-sort="' + c.key + '" aria-sort="' + (on ? (S.ui.sort.dir > 0 ? 'ascending' : 'descending') : 'none') + '"') + '>' + esc(c.label) + (on ? (S.ui.sort.dir > 0 ? ' ▲' : ' ▼') : '') + '</th>';
    }).join('') + '<th>Actions</th></tr>';
  var body = rows.map(function (x) {
    return '<tr data-id="' + esc(x.id) + '"' + (S.ui.sel[x.id] ? ' class="sel"' : '') + '>' +
      '<td class="adm-ck"><input type="checkbox" data-sel="' + esc(x.id) + '"' + (S.ui.sel[x.id] ? ' checked' : '') + ' aria-label="Sélectionner ' + esc(x[CFG.nameKey] || x.id) + '"></td>' +
      cols.map(function (c) { return '<td>' + (c.render ? c.render(x, S) : esc(x[c.key])) + '</td>'; }).join('') +
      '<td class="adm-acts"><button type="button" class="adm-ico" data-act="edit" title="Modifier">✎</button><button type="button" class="adm-ico" data-act="dup" title="Dupliquer">⧉</button><button type="button" class="adm-ico adm-red" data-act="del" title="Supprimer">🗑</button></td></tr>';
  }).join('');
  return '<div class="adm-table-wrap"><table class="adm-table"><thead>' + head + '</thead><tbody>' + (body || '<tr><td colspan="' + (cols.length + 2) + '" class="adm-none">Aucun résultat</td></tr>') + '</tbody></table>' +
    '<div class="adm-count">' + rows.length + ' / ' + S.data.length + ' élément(s)</div></div>';
}
function cardsHTML(rows) {
  return '<div class="adm-cards">' + (rows.map(function (x) { return '<div class="adm-card' + (S.ui.sel[x.id] ? ' sel' : '') + '" data-id="' + esc(x.id) + '">' + CFG.cardFn(x, S) + '<div class="adm-card-acts"><button type="button" class="adm-ico" data-act="edit" title="Modifier">✎</button><button type="button" class="adm-ico" data-act="dup" title="Dupliquer">⧉</button><button type="button" class="adm-ico adm-red" data-act="del" title="Supprimer">🗑</button></div></div>'; }).join('') || '<div class="adm-none">Aucun résultat</div>') + '</div>';
}
function signatureHTML(rows) {
  return '<div class="adm-signature">' + CFG.signature.render(S, rows, { esc: esc, fmtN: fmtN, fmtF: fmtF, pct: pct, norm: norm }) + '</div>';
}

/* ---------------- drawer + dialog ---------------- */
function openDrawer(item) {
  closeDrawer();
  S.ui.drawer = item.id;
  var ov = D.createElement('div'); ov.className = 'adm-ov'; ov.id = CFG.pre + '-ov';
  var dr = D.createElement('aside'); dr.className = 'adm-drawer'; dr.id = CFG.pre + '-drawer'; dr.setAttribute('role', 'dialog'); dr.setAttribute('aria-label', 'Détail');
  dr.innerHTML = '<div class="adm-drawer-h"><b>' + esc(CFG.dialog.labelOpen || 'Détail') + '</b><button type="button" class="adm-ico" data-act="close-drawer" title="Fermer (Échap)">✕</button></div><div class="adm-drawer-b">' + CFG.drawer(item, S, { esc: esc, fmtN: fmtN, fmtF: fmtF, pct: pct }) + '</div>';
  ov.appendChild(dr); D.body.appendChild(ov);
  ov.addEventListener('click', function (e) { if (e.target === ov) closeDrawer(); });
}
function closeDrawer() { var ov = $('#' + CFG.pre + '-ov'); if (ov) ov.remove(); S.ui.drawer = null; }

function openDialog(item) {
  closeDialog();
  var isNew = !item;
  S.ui.dialog = isNew ? null : item.id;
  var ov = D.createElement('div'); ov.className = 'adm-ov'; ov.id = CFG.pre + '-dov';
  var dl = D.createElement('div'); dl.className = 'adm-dialog'; dl.setAttribute('role', 'dialog'); dl.setAttribute('aria-modal', 'true');
  dl.innerHTML = '<div class="adm-dialog-h"><b>' + (isNew ? 'Nouveau — ' : 'Modifier — ') + esc(CFG.dialog.title) + '</b><button type="button" class="adm-ico" data-act="close-dialog">✕</button></div>' +
    '<form class="adm-dialog-b" novalidate>' +
    CFG.dialog.fields.map(function (f) {
      var v = item ? item[f.key] : (f.def != null ? f.def : '');
      if (f.type === 'select' && typeof v === 'boolean') v = v ? 'oui' : 'non';
      if (f.type === 'select') return '<label class="adm-fld">' + esc(f.label) + (f.required ? ' *' : '') + '<select name="' + f.key + '">' + (f.options || []).map(function (o) { return '<option' + (String(o) === String(v) ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') + '</select><span class="adm-err"></span></label>';
      return '<label class="adm-fld">' + esc(f.label) + (f.required ? ' *' : '') + '<input type="' + (f.type || 'text') + '" name="' + f.key + '" value="' + esc(v) + '" ' + (f.step ? 'step="' + f.step + '"' : '') + '><span class="adm-err"></span></label>';
    }).join('') +
    '<div class="adm-dialog-f"><button type="button" class="adm-btn adm-ghost" data-act="close-dialog">Annuler</button><button type="submit" class="adm-btn adm-primary">' + (isNew ? 'Créer' : 'Enregistrer') + '</button></div></form>';
  ov.appendChild(dl); D.body.appendChild(ov);
  var form = $('form', dl);
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true, all = {};
    CFG.dialog.fields.forEach(function (f) {
      var inp = form.elements[f.key];
      if (f.type === 'select' && item && typeof item[f.key] === 'boolean') inp.value = item[f.key] ? 'oui' : 'non';
      var v = inp.value.trim(); all[f.key] = v;
      var err = '';
      if (f.required && !v) err = 'Champ requis';
      else if (f.validate) { try { err = f.validate(v, all, S, item) || ''; } catch (e2) { err = 'Invalide'; } }
      var eEl = inp.parentElement.querySelector('.adm-err'); if (eEl) eEl.textContent = err;
      if (err) ok = false;
    });
    if (!ok) return;
    var mapped = CFG.dialog.map(all, item ? JSON.parse(JSON.stringify(item)) : null, S);
    if (item) {
      var idx = S.data.findIndex(function (x) { return String(x.id) === String(item.id); });
      if (idx >= 0) S.data[idx] = mapped;
      journal('MODIF', CFG.page + ' #' + item.id + ' — ' + (mapped[CFG.nameKey] || ''));
    } else {
      mapped.id = uidMax(S.data);
      S.data.push(mapped);
      journal('CREATION', CFG.page + ' #' + mapped.id + ' — ' + (mapped[CFG.nameKey] || ''));
    }
    persistData(); closeDialog(); renderAll();
  });
  $('input,select', form).focus();
}
function closeDialog() { var ov = $('#' + CFG.pre + '-dov'); if (ov) ov.remove(); S.ui.dialog = null; }

function confirmDialog(msg, cb) {
  var ov = D.createElement('div'); ov.className = 'adm-ov'; ov.id = CFG.pre + '-cov';
  var dl = D.createElement('div'); dl.className = 'adm-dialog adm-dialog-sm';
  dl.innerHTML = '<div class="adm-dialog-h"><b>Confirmation</b></div><div class="adm-dialog-b"><p>' + msg + '</p><div class="adm-dialog-f"><button type="button" class="adm-btn adm-ghost" data-x="0">Annuler</button><button type="button" class="adm-btn adm-danger" data-x="1">Confirmer</button></div></div>';
  ov.appendChild(dl); D.body.appendChild(ov);
  ov.addEventListener('click', function (e) {
    var b = e.target.closest('[data-x]'); if (!b) return;
    ov.remove(); if (b.getAttribute('data-x') === '1') cb();
  });
}

/* ---------------- actions ---------------- */
function applyFilter(f) {
  if (!f) return;
  S.ui.view = f.view || 'table';
  if (f.q != null) S.ui.q = String(f.q);
  for (var k in (CFG.filters || []).reduce(function (m, x) { m[x.id] = 1; return m; }, {})) {
    if (f.filters && f.filters[k] != null) S.ui.filters[k] = f.filters[k];
  }
  persistUI(); renderAll();
}
function resetOne(id) {
  var def = seedArr().filter(function (x) { return String(x.id) === String(id); })[0];
  var it = S.data.filter(function (x) { return String(x.id) === String(id); })[0];
  if (!def || !it) return;
  for (var k in def) it[k] = def[k];
  it.__mod = false; it.__def = def.valeur;
  persistData(); renderAll();
  journal('REINIT', CFG.page + ' #' + id + ' — valeur par défaut restaurée');
}
function persistUI() { lsSet(CFG.lsUI, { view: S.ui.view }); }

function doDelete(ids) {
  var items = S.data.filter(function (x) { return ids.indexOf(String(x.id)) >= 0; });
  confirmDialog(CFG.delConfirm(items), function () {
    S.data = S.data.filter(function (x) { return ids.indexOf(String(x.id)) < 0; });
    ids.forEach(function (id) { S.ui.sel[id] = false; });
    persistData(); renderAll();
    journal('SUPPRESSION', CFG.page + ' — ' + items.length + ' élément(s) : ' + items.map(function (x) { return x[CFG.nameKey] || x.id; }).slice(0, 5).join(', '));
  });
}
function doDuplicate(ids) {
  var items = S.data.filter(function (x) { return ids.indexOf(String(x.id)) >= 0; });
  items.forEach(function (x) {
    var nid = uidMax(S.data);
    var cp = CFG.dupFn(JSON.parse(JSON.stringify(x)), nid);
    S.data.push(cp);
    journal('DUPLICATION', CFG.page + ' #' + x.id + ' → #' + nid);
  });
  persistData(); renderAll();
}

function exportCSV() {
  var cols = (CFG.columns || []).filter(function (c) { return c.csv !== false; });
  var rows = filtered();
  function cell(v) { v = v == null ? '' : String(v); return '"' + v.replace(/"/g, '""') + '"'; }
  var lines = [cols.map(function (c) { return cell(c.label); }).join(';')];
  rows.forEach(function (x) { lines.push(cols.map(function (c) { return cell(c.csvVal ? c.csvVal(x) : x[c.key]); }).join(';')); });
  var blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  var a = D.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'admina-' + CFG.page + '-' + todayISO() + '.csv';
  D.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
  journal('EXPORT', CFG.page + ' — ' + rows.length + ' ligne(s) exportée(s)');
}

function seuilsDialog() {
  var ov = D.createElement('div'); ov.className = 'adm-ov'; ov.id = CFG.pre + '-sov';
  var dl = D.createElement('div'); dl.className = 'adm-dialog adm-dialog-sm';
  dl.innerHTML = '<div class="adm-dialog-h"><b>Seuils d\u2019alerte</b></div><div class="adm-dialog-b">' +
    (CFG.seuils || []).map(function (s) {
      return '<label class="adm-fld">' + esc(s.label) + ' <output>' + fmtN(S.seuils[s.id], s.dec || 0) + (s.unit || '') + '</output>' +
        '<input type="range" min="' + s.min + '" max="' + s.max + '" step="' + (s.step || 1) + '" value="' + S.seuils[s.id] + '" data-seuil="' + s.id + '"></label>';
    }).join('') +
    '<div class="adm-dialog-f"><button type="button" class="adm-btn adm-ghost" data-x="0">Fermer</button></div></div>';
  ov.appendChild(dl); D.body.appendChild(ov);
  ov.addEventListener('input', function (e) {
    var r = e.target.closest('[data-seuil]'); if (!r) return;
    var id = r.getAttribute('data-seuil'); S.seuils[id] = Number(r.value);
    var out = r.parentElement.querySelector('output'); var def = (CFG.seuils || []).filter(function (x) { return x.id === id; })[0];
    if (out) out.textContent = fmtN(r.value, def && def.dec || 0) + (def && def.unit || '');
    lsSet(CFG.lsSeuils, S.seuils); renderAlerts(); renderKpis(); renderCharts();
  });
  ov.addEventListener('click', function (e) { if (e.target.closest('[data-x]') || e.target === ov) { ov.remove(); journal('SEUILS', CFG.page + ' — seuils mis à jour'); } });
}

function helpDialog() {
  var ov = D.createElement('div'); ov.className = 'adm-ov'; ov.id = CFG.pre + '-hov';
  var dl = D.createElement('div'); dl.className = 'adm-dialog adm-dialog-sm';
  dl.innerHTML = '<div class="adm-dialog-h"><b>Raccourcis & aide</b></div><div class="adm-dialog-b"><ul class="adm-help">' +
    '<li><b>N</b> nouveau · <b>E</b> export CSV · <b>/</b> recherche</li>' +
    '<li><b>C</b> table · <b>P</b> cartes · <b>T</b> ' + esc(CFG.signature.short || 'vue signature') + '</li>' +
    '<li><b>S</b> sélection tout · <b>K</b> seuils · <b>?</b> cette aide</li>' +
    '<li>Échap ferme fenêtres et tiroirs</li>' +
    '<li>Panneau burger sous 820 px — les filtres se replient</li></ul>' +
    '<div class="adm-dialog-f"><button type="button" class="adm-btn adm-primary" data-x="0">Fermer</button></div></div>';
  ov.appendChild(dl); D.body.appendChild(ov);
  ov.addEventListener('click', function (e) { if (e.target.closest('[data-x]') || e.target === ov) ov.remove(); });
}

function journalRead() { /* lecture passive : le journal est alimenté ici et par les autres pages */ }

/* ---------------- événements ---------------- */
function bindEvents(wrap) {
  wrap.addEventListener('click', function (e) {
    var t = e.target;
    var seg = t.closest('.adm-seg, .adm-legend li, .adm-click[data-filter]');
    if (seg) { var f = seg.getAttribute('data-filter'); if (f) { try { applyFilter(JSON.parse(f)); } catch (e2) { } } return; }
    var kpi = t.closest('[data-kpi]');
    if (kpi && !kpi.disabled) { var kd = (CFG.kpis || [])[(+kpi.getAttribute('data-kpi'))]; if (kd && kd.filter) applyFilter(kd.filter(S)); return; }
    var al = t.closest('[data-alert]');
    if (al && !al.disabled) { var ad = (CFG.alerts || [])[(+al.getAttribute('data-alert'))]; if (ad && ad.filterApply) { applyFilter(ad.filterApply(S)); } return; }
    var vbtn = t.closest('[data-view]');
    if (vbtn) { S.ui.view = vbtn.getAttribute('data-view'); persistUI(); renderToolbar(); renderView(); return; }
    var act = t.closest('[data-act]');
    if (act) {
      var a = act.getAttribute('data-act');
      var tr = act.closest('tr[data-id], .adm-card[data-id]');
      var id = tr ? tr.getAttribute('data-id') : null;
      var item = id ? S.data.filter(function (x) { return String(x.id) === String(id); })[0] : null;
      if (a === 'new') openDialog(null);
      else if (a === 'csv') exportCSV();
      else if (a === 'help') helpDialog();
      else if (a === 'seuils') seuilsDialog();
      else if (a === 'reset') { S.ui.filters = {}; S.ui.q = ''; var qi = $('#' + CFG.pre + '-q'); if (qi) qi.value = ''; renderAll(); }
      else if (a === 'edit' && item) openDialog(item);
      else if (a === 'dup' && item) doDuplicate([String(item.id)]);
      else if (a === 'del' && item) doDelete([String(item.id)]);
      else if (a === 'dup-sel') { doDuplicate(Object.keys(S.ui.sel).filter(function (k) { return S.ui.sel[k]; })); }
      else if (a === 'del-sel') { doDelete(Object.keys(S.ui.sel).filter(function (k) { return S.ui.sel[k]; })); }
      else if (a === 'clear-sel') { S.ui.sel = {}; renderBulk(); renderView(); }
      else if (a === 'close-drawer') closeDrawer();
      else if (a === 'close-dialog') closeDialog();
      else if (a === 'open' && item) openDrawer(item);
      else if (a === 'reset-one' && id) resetOne(id);
      return;
    }
    var st = t.closest('[data-sort]');
    if (st) {
      var k = st.getAttribute('data-sort');
      if (S.ui.sort.key === k) S.ui.sort.dir *= -1; else { S.ui.sort.key = k; S.ui.sort.dir = 1; }
      renderView(); return;
    }
    var card = t.closest('.adm-card[data-id], tr[data-id]');
    if (card && !t.closest('input,button')) {
      var it = S.data.filter(function (x) { return String(x.id) === String(card.getAttribute('data-id')); })[0];
      if (it) openDrawer(it);
    }
  });
  wrap.addEventListener('change', function (e) {
    var t = e.target;
    if (t.getAttribute && t.getAttribute('data-filter')) { S.ui.filters[t.getAttribute('data-filter')] = t.value; renderAll(); return; }
    if (t.getAttribute && t.getAttribute('data-sel')) { S.ui.sel[t.getAttribute('data-sel')] = t.checked; renderBulk(); renderView(); return; }
    if (t.id === CFG.pre + '-all') { var rows = filtered(); var on = t.checked; rows.forEach(function (x) { S.ui.sel[String(x.id)] = on; }); renderBulk(); renderView(); }
  });
  wrap.addEventListener('input', debounce(function (e) {
    var t = e.target;
    if (t.id === CFG.pre + '-q') { S.ui.q = t.value; renderView(); }
  }, 200));

  D.addEventListener('keydown', function (e) {
    if (!isRoute()) return;
    var tag = (e.target.tagName || '').toLowerCase();
    var inField = tag === 'input' || tag === 'textarea' || tag === 'select';
    if (e.key === 'Escape') { closeDrawer(); closeDialog(); var s = $('#' + CFG.pre + '-sov'); if (s) s.remove(); var h = $('#' + CFG.pre + '-hov'); if (h) h.remove(); return; }
    if (inField) return;
    var k = e.key.toLowerCase();
    if (k === 'n') { e.preventDefault(); openDialog(null); }
    else if (k === 'e') { e.preventDefault(); exportCSV(); }
    else if (e.key === '/') { e.preventDefault(); var q = $('#' + CFG.pre + '-q'); if (q) q.focus(); }
    else if (k === 'c') { S.ui.view = 'table'; persistUI(); renderToolbar(); renderView(); }
    else if (k === 'p') { S.ui.view = 'cards'; persistUI(); renderToolbar(); renderView(); }
    else if (k === 't') { S.ui.view = 'signature'; persistUI(); renderToolbar(); renderView(); }
    else if (k === 's') { var rows = filtered(); var anyOff = rows.some(function (x) { return !S.ui.sel[String(x.id)]; }); rows.forEach(function (x) { S.ui.sel[String(x.id)] = anyOff; }); renderBulk(); renderView(); }
    else if (k === 'k') { seuilsDialog(); }
    else if (e.key === '?') { helpDialog(); }
  });
}

/* ---------------- dark + burger ---------------- */
function watchDark() {
  var html = D.documentElement;
  function apply() { var dark = html.classList.contains('adem7-dark') || html.classList.contains('admina-dark') || (W.matchMedia && W.matchMedia('(prefers-color-scheme: dark)').matches && !html.classList.contains('admina-light')); var w = $('#admina-' + CFG.pre + '-wrap'); if (w) w.classList.toggle('adm-dark', !!dark); }
  new MutationObserver(apply).observe(html, { attributes: true, attributeFilter: ['class'] });
  if (W.matchMedia) { var mq = W.matchMedia('(prefers-color-scheme: dark)'); if (mq.addEventListener) mq.addEventListener('change', apply); }
  apply();
}
function burger() {
  var mq = W.matchMedia('(max-width: 820px)');
  function apply() { var w = $('#admina-' + CFG.pre + '-wrap'); if (!w) return; w.classList.toggle('adm-mobile', mq.matches); var t = $('#adm-' + CFG.pre + '-burger'); if (t) t.setAttribute('aria-expanded', mq.matches ? String(w.classList.contains('adm-open')) : 'false'); }
  mq.addEventListener ? mq.addEventListener('change', apply) : mq.addListener(apply);
  apply();
}
D.addEventListener('click', function (e) {
  var b = e.target.closest('#adm-' + CFG.pre + '-burger');
  if (b) { var w = $('#admina-' + CFG.pre + '-wrap'); if (w) w.classList.toggle('adm-open'); b.setAttribute('aria-expanded', String(w.classList.contains('adm-open'))); }
});

/* ---------------- boot ---------------- */
function boot() {
  onRoute();
  watchDark();
  setTimeout(burger, 100);
}
boot();

})();
