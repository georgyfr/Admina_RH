/* =====================================================================
ADMINA-RH — /sources-roi = LE JUGE DE PAIX DES CANAUX.
   Chaque source coûte et rapporte : la page arbitre (garder / développer /
   couper). Une source se lit en 3 dimensions : VOLUME (candidats), EFFICACITÉ
   (conversion jusqu'à l'embauche), COÛT (par candidat, par embauche). VUE
   SIGNATURE : « Matrice efficacité/coût » — scatter 4 quadrants + classement
   ROI. Alertes : coûteuse sans embauche, coût/embauche hors seuil, conversion
   faible, meilleur ROI, source sans candidat.
   Module généré par le canon W4 (moteur + config sourcesroi).
   Additif-sur-natif : la page React native reste intacte.
   ===================================================================== */
(function () {
'use strict';
if (window.__ADMINA_ROI__) return; window.__ADMINA_ROI__ = { v: '1.0-w4' };
var CFG = {"lsData":"admina-sourcesroi-data","lsUI":"admina-sourcesroi-ui","lsSeuils":"admina-sourcesroi-seuils","routeRe":/\/Domaine1_Recrutement_Candidats\/sources-roi\/?$/,"nameKey":"source","searchKeys":["source","numero","satisfaction"],"seed":"[{id:1,numero:\"ROI-001\",source:\"Site web entreprise\",nbCandidats:32,nbEmbauches:3,coutTotal:5e4,coutParCandidat:1563,coutParEmbauche:16667,delaiMoyen:25,tauxRetention:85,satisfaction:\"Satisfait\",annee:\"2025\"},{id:2,numero:\"ROI-002\",source:\"Référence interne\",nbCandidats:28,nbEmbauches:4,coutTotal:0,coutParCandidat:0,coutParEmbauche:0,delaiMoyen:18,tauxRetention:100,satisfaction:\"Tres satisfait\",annee:\"2025\"},{id:3,numero:\"ROI-003\",source:\"LinkedIn\",nbCandidats:25,nbEmbauches:2,coutTotal:18e4,coutParCandidat:7200,coutParEmbauche:9e4,delaiMoyen:35,tauxRetention:90,satisfaction:\"Satisfait\",annee:\"2025\"},{id:4,numero:\"ROI-004\",source:\"Indeed\",nbCandidats:18,nbEmbauches:1,coutTotal:12e4,coutParCandidat:6667,coutParEmbauche:12e4,delaiMoyen:30,tauxRetention:75,satisfaction:\"Neutre\",annee:\"2025\"},{id:5,numero:\"ROI-005\",source:\"Cabinet de recrutement\",nbCandidats:22,nbEmbauches:3,coutTotal:45e4,coutParCandidat:20455,coutParEmbauche:15e4,delaiMoyen:40,tauxRetention:95,satisfaction:\"Satisfait\",annee:\"2025\"},{id:6,numero:\"ROI-006\",source:\"Candidature spontanée\",nbCandidats:15,nbEmbauches:1,coutTotal:0,coutParCandidat:0,coutParEmbauche:0,delaiMoyen:22,tauxRetention:80,satisfaction:\"Neutre\",annee:\"2025\"}]","conv":function (x) { return Number(x.nbCandidats) ? Math.round(Number(x.nbEmbauches || 0) / Number(x.nbCandidats) * 1000) / 10 : null; },"cpe":function (x) { return Number(x.nbEmbauches) ? Math.round(Number(x.coutTotal || 0) / Number(x.nbEmbauches)) : null; },"hero":{"kicker":"LE JUGE DE PAIX DES CANAUX","title":"Sources & ROI — arbitrer : garder, développer, couper","subtitle":function (S) { var c = 0, e = 0, ct = 0; S.data.forEach(function (x) { c += Number(x.nbCandidats || 0); e += Number(x.nbEmbauches || 0); ct += Number(x.coutTotal || 0); }); return S.data.length + ' canaux, ' + c + ' candidats, ' + e + ' embauches, ' + fmtF(ct) + ' engagés — coût moyen par embauche : ' + fmtF(e ? ct / e : 0) + '.'; }},"alerts":[{"icon":"💸","sev":"danger","count":function (S) { return S.data.filter(function (x) { return Number(x.coutTotal || 0) > 0 && !Number(x.nbEmbauches); }).length; },"test":function (S) { return S.data.some(function (x) { return Number(x.coutTotal || 0) > 0 && !Number(x.nbEmbauches); }); },"label":function () { return 'Coûteuses sans aucune embauche'; },"filterApply":function () { return { filters: { statut: 'Coûteuse à vide' } }; }},{"icon":"⬈","sev":"warn","count":function (S) { return S.data.filter(function (x) { return roiCpe(x) > (S.seuils.coutEmbauche || 100000); }).length; },"test":function (S) { return S.data.some(function (x) { return roiCpe(x) > (S.seuils.coutEmbauche || 100000); }); },"label":function (S) { return 'Coût/embauche au-delà du seuil'; },"filterApply":function () { return { filters: { statut: 'Coût élevé' } }; }},{"icon":"⬇","sev":"warn","count":function (S) { return S.data.filter(function (x) { var c = roiConv(x); return c != null && c < (S.seuils.conversion || 10) && Number(x.nbCandidats) >= 10; }).length; },"test":function (S) { return S.data.some(function (x) { var c = roiConv(x); return c != null && c < (S.seuils.conversion || 10) && Number(x.nbCandidats) >= 10; }); },"label":function () { return 'Volume élevé mais mauvaise conversion'; },"filterApply":function () { return { filters: { statut: 'Conversion faible' } }; }},{"icon":"🏆","sev":"ok","count":function (S) { return bestRoi(S) ? 1 : 0; },"test":function (S) { return !!bestRoi(S); },"label":function (S) { return 'Meilleur ROI : ' + (bestRoi(S) ? bestRoi(S).source : '—'); },"filterApply":function () { return { filters: { statut: 'Meilleur ROI' } }; }},{"icon":"∅","sev":"warn","count":function (S) { return S.data.filter(function (x) { return !Number(x.nbCandidats); }).length; },"test":function (S) { return S.data.some(function (x) { return !Number(x.nbCandidats); }); },"label":function () { return 'Canaux sans candidat'; },"filterApply":function () { return { filters: { statut: 'Sans candidat' } }; }}],"kpis":[{"label":"CANAUX","calc":function (S) { return fmtN(S.data.length); },"sub":"sources actives"},{"label":"CANDIDATS","calc":function (S) { return fmtN(S.data.reduce(function (a, x) { return a + Number(x.nbCandidats || 0); }, 0)); },"sub":"apportés au total","filter":function () { return { filters: { statut: 'Tous' }, view: 'signature' }; }},{"label":"EMBAUCHES","calc":function (S) { return fmtN(S.data.reduce(function (a, x) { return a + Number(x.nbEmbauches || 0); }, 0)); },"sub":"issues des canaux"},{"label":"COÛT TOTAL","calc":function (S) { return fmtF(S.data.reduce(function (a, x) { return a + Number(x.coutTotal || 0); }, 0)); },"sub":"engagé sur la période"},{"label":"COÛT / EMBAUCHE","calc":function (S) { var e = S.data.reduce(function (a, x) { return a + Number(x.nbEmbauches || 0); }, 0), c = S.data.reduce(function (a, x) { return a + Number(x.coutTotal || 0); }, 0); return fmtF(e ? c / e : 0); },"sub":"moyen pondéré","filter":function () { return { view: 'signature' }; }},{"label":"MEILLEURE CONVERSION","calc":function (S) { var b = S.data.filter(function (x) { return Number(x.nbCandidats) >= 10; }).sort(function (a, b2) { return roiConv(b2) - roiConv(a); })[0]; return b ? pct(roiConv(b), 1) : '—'; },"sub":"≥ 10 candidats","filter":function () { return { filters: { statut: 'Meilleur ROI' } }; }}],"charts":[{"type":"donut","title":"Embauches par canal","unit":"embauches","calc":function (S) { var cols = ['#2e7d5b', '#7a5ba8', '#2f6f9f', '#b26a00', '#c05f33', '#4c8b6f', '#8a6d3b']; return S.data.map(function (x, i) { return { label: x.source, value: Number(x.nbEmbauches || 0), color: cols[i % cols.length], filter: JSON.stringify({ filters: { statut: 'Tous' }, q: x.source }) }; }); }},{"type":"bars","title":"Coût par embauche (kFCFA)","calc":function (S) { return S.data.map(function (x) { return { label: String(x.source).split(' ')[0], value: Math.round(roiCpe(x) / 1000), color: roiCpe(x) > (S.seuils.coutEmbauche || 100000) ? '#f44336' : '#2e7d5b', filter: JSON.stringify({ filters: { statut: 'Tous' }, q: x.source }) }; }); }}],"filters":[{"id":"statut","label":"Diagnostic","options":function () { return ['Tous', 'Coûteuse à vide', 'Coût élevé', 'Conversion faible', 'Meilleur ROI', 'Sans candidat']; },"match":function (x, v) { if (v === 'Coûteuse à vide') return Number(x.coutTotal || 0) > 0 && !Number(x.nbEmbauches); if (v === 'Coût élevé') return roiCpe(x) > (SEUILS_R().coutEmbauche || 100000); if (v === 'Conversion faible') return roiConv(x) != null && roiConv(x) < (SEUILS_R().conversion || 10) && Number(x.nbCandidats) >= 10; if (v === 'Meilleur ROI') return bestRoiB(x); if (v === 'Sans candidat') return !Number(x.nbCandidats); return true; }},{"id":"satisfaction","label":"Satisfaction","options":function (S) { return ['Tous'].concat(Object.keys(S.data.reduce(function (a, x) { a[x.satisfaction] = 1; return a; }, {}))); },"match":function (x, v) { return x.satisfaction === v; }},{"id":"annee","label":"Année","options":function (S) { return ['Tous'].concat(Object.keys(S.data.reduce(function (a, x) { a[x.annee] = 1; return a; }, {}))); },"match":function (x, v) { return String(x.annee) === String(v); }}],"columns":[{"key":"source","label":"Canal","render":function (x) { return '<b>' + esc(x.source) + '</b><br><span style="font-size:11px;color:var(--aw-mut)">' + esc(x.numero || '') + '</span>'; }},{"key":"nbCandidats","label":"Candidats"},{"key":"nbEmbauches","label":"Embauches"},{"key":"conv","label":"Conversion","sortable":false,"render":function (x) { var c = roiConv(x); return c == null ? '—' : pct(c, 1); },"csvVal":function (x) { return roiConv(x); }},{"key":"coutTotal","label":"Coût total","render":function (x) { return fmtF(x.coutTotal); }},{"key":"cpe","label":"Coût/embauche","sortable":false,"render":function (x) { var v = roiCpe(x); return v == null ? '—' : fmtF(v); },"csvVal":function (x) { return roiCpe(x); }},{"key":"delaiMoyen","label":"Délai (j)"},{"key":"tauxRetention","label":"Rétention","render":function (x) { return x.tauxRetention != null ? pct(x.tauxRetention, 0) : '—'; }},{"key":"satisfaction","label":"Satisfaction","render":function (x) { var m = { 'Tres satisfait': 'ok', 'Tres insatisfait': 'bad', 'Insatisfait': 'warn' }; return '<span class="adm-badge ' + (m[x.satisfaction] || 'mut') + '">' + esc(x.satisfaction || '—') + '</span>'; }}],"cardFn":function (x, S) {
    var c = roiConv(x), cpe = roiCpe(x);
    return '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><b style="font-size:14px">' + esc(x.source) + '</b><span class="adm-badge ' + (c != null && c >= 12 ? 'ok' : c != null && c < 8 ? 'bad' : 'warn') + '">' + (c == null ? '—' : pct(c, 1)) + '</span></div>' +
      '<div style="font-size:12px;color:var(--aw-mut);margin:4px 0">' + esc(x.numero || '') + ' · ' + esc(x.annee || '') + '</div>' +
      '<div style="display:flex;gap:12px;font-size:12px;flex-wrap:wrap"><span>' + fmtN(x.nbCandidats) + ' candidats</span><span>' + fmtN(x.nbEmbauches) + ' embauches</span><span>' + fmtF(x.coutTotal) + '</span></div>' +
      '<div style="font-size:12px;margin-top:4px">Coût/embauche : <b>' + (cpe == null ? '—' : fmtF(cpe)) + '</b> · Rétention : ' + pct(x.tauxRetention, 0) + '</div>';
  },"signature":{"short":"Matrice ROI","title":"La matrice efficacité / coût","render":function (S, rows, h) {
      var pts = rows.filter(function (x) { return roiConv(x) != null; });
      var maxC = 1, maxV = 1;
      pts.forEach(function (x) { maxC = Math.max(maxC, roiCpe(x) || 0); maxV = Math.max(maxV, Number(x.nbCandidats || 1)); });
      var W2 = 520, H2 = 300, pad = 46;
      function px(v) { return pad + (v / maxC) * (W2 - pad - 16); }
      function py(v) { return H2 - pad - (v / Math.max(30, Math.max.apply(null, pts.map(roiConv)))) * (H2 - pad - 20); }
      var svg = '<svg viewBox="0 0 ' + W2 + ' ' + H2 + '" style="width:100%;height:auto" role="img" aria-label="Matrice efficacité coût">' +
        '<rect x="' + pad + '" y="16" width="' + (W2 - pad - 16) + '" height="' + (H2 - pad - 20) + '" fill="none" stroke="var(--aw-line)"/>' +
        '<text x="10" y="26" font-size="10" fill="var(--aw-mut)">Conversion %</text>' +
        '<text x="' + (W2 - pad) + '" y="' + (H2 - 8) + '" font-size="10" fill="var(--aw-mut)" text-anchor="end">Coût par embauche →</text>';
      pts.forEach(function (x) {
        var c = roiCpe(x) || 0, cv = roiConv(x), r = 6 + (Number(x.nbCandidats || 1) / maxV) * 16;
        var col = c > (S.seuils.coutEmbauche || 100000) ? '#f44336' : (cv >= 12 ? '#2e7d32' : '#ff9800');
        svg += '<circle class="adm-click" data-filter="' + esc(JSON.stringify({ q: x.source })) + '" cx="' + px(c).toFixed(1) + '" cy="' + py(cv).toFixed(1) + '" r="' + r.toFixed(1) + '" fill="' + col + '" fill-opacity=".55" stroke="' + col + '"><title>' + esc(x.source) + ' — coût/embauche ' + fmtF(roiCpe(x)) + ', conversion ' + pct(cv, 1) + ', ' + fmtN(x.nbCandidats) + ' candidats</title></circle>' +
          '<text x="' + px(c).toFixed(1) + '" y="' + (py(cv) - r - 4).toFixed(1) + '" font-size="9" text-anchor="middle" fill="var(--aw-fg)">' + esc(String(x.source).split(' ')[0]) + '</text>';
      });
      svg += '</svg>';
      var rank = rows.slice().sort(function (a, b) { return (roiConv(b) || 0) - (roiConv(a) || 0); }).map(function (x, i) {
        return '<tr><td>' + (i + 1) + '</td><td><b>' + h.esc(x.source) + '</b></td><td>' + (roiConv(x) == null ? '—' : h.pct(roiConv(x), 1)) + '</td><td>' + (roiCpe(x) == null ? '—' : h.fmtF(roiCpe(x))) + '</td><td>' + h.fmtN(x.nbEmbauches) + '</td></tr>';
      }).join('');
      return '<h4 class="adm-sig-t">La matrice efficacité / coût</h4><p class="adm-sig-s">X = coût par embauche, Y = conversion, taille = volume de candidats. Haut-gauche = efficient, bas-droite = à couper. Cliquez une bulle pour filtrer.</p>' + svg +
        '<h4 style="margin-top:14px">Classement ROI (par conversion)</h4><table style="width:100%;border-collapse:collapse;font-size:12px"><tr><th>#</th><th>Canal</th><th>Conversion</th><th>Coût/embauche</th><th>Embauches</th></tr>' + rank + '</table>';
    }},"dialog":{"labelNew":"Canal","labelOpen":"Canal","title":"source de recrutement","fields":[{"key":"source","label":"Nom du canal","required":true,"validate":function (v, a, S, item) { return S.data.some(function (x) { return norm(x.source) === norm(v) && (!item || String(x.id) !== String(item.id)); }) ? 'Ce canal existe déjà' : ''; }},{"key":"nbCandidats","label":"Candidats apportés","type":"number","required":true,"validate":function (v) { return (isNaN(Number(v)) || Number(v) < 0) ? 'Nombre ≥ 0' : ''; }},{"key":"nbEmbauches","label":"Embauches","type":"number","required":true,"validate":function (v) { return (isNaN(Number(v)) || Number(v) < 0) ? 'Nombre ≥ 0' : ''; }},{"key":"coutTotal","label":"Coût total (FCFA)","type":"number","validate":function (v) { return (isNaN(Number(v)) || Number(v) < 0) ? 'Nombre ≥ 0' : ''; }},{"key":"delaiMoyen","label":"Délai moyen (jours)","type":"number"},{"key":"tauxRetention","label":"Taux de rétention (%)","type":"number"},{"key":"satisfaction","label":"Satisfaction","type":"select","options":["Tres satisfait","Satisfait","Neutre","Insatisfait","Tres insatisfait"]},{"key":"annee","label":"Année","required":true,"validate":function (v) { return /^\d{4}$/.test(v) ? '' : 'Année sur 4 chiffres'; }}],"map":function (a, item, S) {
      var o = item || {}; o.source = a.source; o.nbCandidats = Number(a.nbCandidats) || 0; o.nbEmbauches = Number(a.nbEmbauches) || 0; o.coutTotal = Number(a.coutTotal) || 0; o.delaiMoyen = Number(a.delaiMoyen) || 0; o.tauxRetention = Number(a.tauxRetention) || 0; o.satisfaction = a.satisfaction || 'Neutre'; o.annee = a.annee;
      o.numero = o.numero || ('ROI-' + String(uidMax(S.data)).padStart(3, '0'));
      o.coutParCandidat = o.nbCandidats ? Math.round(o.coutTotal / o.nbCandidats) : 0;
      o.coutParEmbauche = o.nbEmbauches ? Math.round(o.coutTotal / o.nbEmbauches) : 0;
      return o;
    }},"drawer":function (x, S, h) {
    return '<h4>' + h.esc(x.source) + '</h4><p style="color:var(--aw-mut)">' + h.esc(x.numero || '') + ' · ' + h.esc(x.annee || '') + '</p>' +
      '<h4>Lecture en 3 dimensions</h4><table>' +
      '<tr><td>Volume</td><td>' + h.fmtN(x.nbCandidats) + ' candidats</td></tr>' +
      '<tr><td>Efficacité</td><td>' + (roiConv(x) == null ? '—' : h.pct(roiConv(x), 1)) + ' de conversion</td></tr>' +
      '<tr><td>Coût total</td><td>' + h.fmtF(x.coutTotal) + '</td></tr>' +
      '<tr><td>Coût/candidat</td><td>' + (x.nbCandidats ? h.fmtF(Number(x.coutTotal || 0) / x.nbCandidats) : '—') + '</td></tr>' +
      '<tr><td>Coût/embauche</td><td>' + (roiCpe(x) == null ? '—' : h.fmtF(roiCpe(x))) + '</td></tr>' +
      '<tr><td>Délai moyen</td><td>' + h.fmtN(x.delaiMoyen) + ' j</td></tr>' +
      '<tr><td>Rétention</td><td>' + (x.tauxRetention != null ? h.pct(x.tauxRetention, 0) : '—') + '</td></tr>' +
      '<tr><td>Satisfaction</td><td>' + h.esc(x.satisfaction || '—') + '</td></tr></table>' +
      '<h4>Verdict</h4><p>' + verdict(x) + '</p>';
  },"seuils":[{"id":"coutEmbauche","label":"Coût/embauche maximum (FCFA)","min":20000,"max":300000,"step":5000,"def":100000,"unit":" FCFA"},{"id":"conversion","label":"Conversion minimum (%)","min":2,"max":50,"def":10,"unit":" %"},{"id":"retentionMin","label":"Rétention minimum (%)","min":50,"max":100,"def":80,"unit":" %"}],"dupFn":function (x, nid, S) { var o = JSON.parse(JSON.stringify(x)); o.id = nid; o.source = x.source + ' (copie)'; o.numero = 'ROI-' + String(nid).padStart(3, '0'); return o; },"delConfirm":function (items) { return 'Supprimer <b>' + items.length + '</b> canal(aux) ? L\'analyse ROI correspondante disparaîtra. Action journalisée.'; },"page":"sourcesroi","apiName":"__ADMINA_ROI_API__","uiName":"__ADMINA_ROI_UI__","pre":"aro","dataKey":"sources"};
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
