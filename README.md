# SOMA PARC V1.5.1 — Correction & Hardening

Module autonome de gestion stratégique du parc automobile VYV Ambulance.

Cette version est une version de stabilisation professionnelle de SOMA PARC V1.5. Elle ne cherche pas à ajouter une nouvelle couche marketing : elle corrige, fiabilise, documente et rend plus honnêtes les exports et l'API.

---

## AUDIT V1.5.1 — Corrections appliquées

### Points identifiés dans la V1.5

- Certains exports étaient nommés « PowerPoint » alors qu'ils produisaient en réalité un JSON exploitable comme plan de présentation.
- L'export PDF reposait sur `window.print()` sans feuille d'impression dédiée suffisamment explicite.
- L'API publique pouvait être écrasée partiellement par les patchs V1.5 et ne garantissait pas toujours une réponse stable sans fichier importé.
- Le diagnostic développeur ne testait pas assez de composants : optimisation, exports, API complète, performance.
- Le moteur d'optimisation ne documentait pas assez clairement les exclusions et reports.
- Les cas limites — absence de données, scénario vide, budget nul, contraintes trop fortes — pouvaient produire des réponses peu explicites.
- Certaines fonctions étaient présentes mais leur comportement n'était pas assez documenté.

### Corrections V1.5.1

- Ajout d'un module `js/hardening.js` chargé en dernier, sans refondre l'architecture.
- Stabilisation de `window.SomaParc` : toutes les fonctions attendues existent, ne plantent pas et retournent une valeur même sans fichier importé.
- Renommage fonctionnel des exports trompeurs :
  - le bouton V1.5 « Export PowerPoint » devient « Export présentation HTML » ;
  - l'ancien export JSON est documenté comme un plan de présentation JSON, pas comme un `.pptx` natif.
- Ajout d'une feuille CSS `@media print` pour produire un PDF propre via l'impression navigateur.
- Amélioration du diagnostic avec statuts `✓ OK`, `⚠ Avertissement`, `✕ Erreur`.
- Renforcement du moteur d'optimisation : sécurisation des cas vides, explication des exclusions, amélioration du respect des minima Ambulance/VSL lorsque le budget le permet.
- Documentation des formules métier et des limites connues.

---

## Architecture

```text
soma-parc-v1-5-1/
├── index.html
├── css/
│   ├── variables.css
│   ├── components.css
│   └── style.css
├── js/
│   ├── utils.js
│   ├── storage.js
│   ├── score.js
│   ├── parser.js
│   ├── validator.js
│   ├── importExcel.js
│   ├── filters.js
│   ├── charts.js
│   ├── simulator.js
│   ├── executive.js
│   ├── dashboard.js
│   ├── table.js
│   ├── app.js
│   ├── optimizer.js
│   └── hardening.js
├── config/
│   └── score.json
└── README.md
```

`hardening.js` est une couche de correction non intrusive. Il ne supprime aucun module existant et ne change pas l'identité visuelle.

---

## État réel des fonctionnalités

### Disponible

- Import Excel/CSV type export Power BI.
- Mapping automatique des colonnes par synonymes.
- Validation qualité des données.
- Score de criticité véhicule.
- Tableau priorisé, filtres, tri, pagination.
- Tableau de bord KPI.
- Centre des anomalies.
- Simulation de renouvellement.
- Scénarios : minimal, recommandé, ambitieux, budget libre.
- Recommandation exécutive.
- Health Index.
- Dossier COMEX en HTML intégré à l'application.
- Copilote stratégique V1.5 : comparaison de stratégies.
- Plan pluriannuel 2027-2031.
- Exports CSV, Excel, JSON, HTML de présentation.
- Impression PDF via navigateur.
- API publique stable.
- Diagnostic renforcé.

### Limites connues

- L'export PowerPoint natif `.pptx` n'est pas produit dans cette version. La V1.5.1 génère un fichier HTML de présentation ou un JSON de plan de slides.
- Le PDF est généré via l'impression navigateur (`window.print()`), avec une feuille CSS print dédiée.
- Les régions sont inférées lorsque la donnée région n'existe pas. Si le fichier Power BI contient une vraie région, elle est utilisée.
- Les valeurs de reprise, coûts de remplacement et économies d'entretien sont des hypothèses paramétrables, non issues d'une source comptable réelle.
- L'optimisation est un arbitrage heuristique robuste, pas une résolution mathématique exhaustive de type programmation linéaire.

---

## Formules métier documentées

### Score de criticité

Le score véhicule est calculé à partir du fichier `config/score.json` :

- âge du véhicule ;
- contrôle technique proche ou dépassé ;
- contrôle taximètre proche ou dépassé ;
- accidents ;
- dommages ;
- amendes.

Classification métier :

- `0–39` : conserver ;
- `40–59` : surveiller ;
- `60–79` : planifier ;
- `80+` : remplacer prioritairement.

### Véhicules critiques

Un véhicule est critique si son score est supérieur ou égal à `70` dans l'API publique et les tableaux de synthèse. Les scénarios peuvent utiliser des seuils plus fins selon leur logique.

### Health Index

Le Health Index est un score réseau sur 100 tenant compte de :

- âge moyen ;
- part de véhicules critiques ;
- conformité réglementaire ;
- sinistralité ;
- équilibre entre agences ;
- part de véhicules anciens.

Plus le score est élevé, plus le parc est considéré comme sain.

### CAPEX, reprises et investissement net

```text
CAPEX brut = somme des coûts de remplacement
Reprises = somme des reprises estimées
Investissement net = CAPEX brut - reprises
```

### Amortissements

Par défaut :

```text
Amortissement annuel = investissement net / durée d'amortissement
Amortissement mensuel = amortissement annuel / 12
```

Durée par défaut : 5 ans.

### Économies d'entretien

Hypothèses V1.5.1 :

- véhicule critique remplacé : 1 500 € / an ;
- véhicule à risque remplacé : 800 € / an ;
- autre véhicule remplacé : 350 € / an.

### ROI entretien

```text
ROI entretien = économies annuelles estimées / investissement net
```

Ce ROI est volontairement prudent : il ne prétend pas mesurer tout le retour économique, seulement la partie entretien.

---

## Optimiseur stratégique

Le moteur `optimizer.js`, renforcé par `hardening.js`, compare plusieurs stratégies :

- Patrimoine ;
- Sécurité ;
- Exploitation ;
- Financier ;
- Équilibre territorial ;
- Libre.

Il prend en compte :

- budget maximum ;
- nombre maximum de véhicules ;
- plafond par agence ;
- plafond par région ;
- plafond par type ;
- minimum Ambulance ;
- minimum VSL ;
- cible d'âge moyen ;
- cible Health Index.

Chaque véhicule peut être :

- retenu, avec une justification ;
- reporté, avec une raison ;
- exclu, avec une contrainte explicite.

---

## Exports disponibles

### CSV / Excel

Exports tabulaires des lignes filtrées ou des scénarios.

### JSON SOMA

Export technique destiné à préparer l'intégration future dans SOMA.

### COMEX JSON

Export complet contenant :

- meilleure stratégie ;
- stratégies comparées ;
- plan 5 ans ;
- explications par destinataire ;
- limites.

### Présentation HTML

Export `soma_parc_comex_presentation_v1_5_1.html`, ouvrable dans un navigateur, utilisable comme support de présentation ou base de transformation en PowerPoint.

### PDF

PDF via impression navigateur. Utiliser le bouton PDF, puis choisir « Enregistrer en PDF ».

---

## API publique

Toutes les fonctions ci-dessous existent et retournent une valeur stable même sans fichier importé :

```javascript
window.SomaParc.importPowerBI(file)
window.SomaParc.getVehicles()
window.SomaParc.getDashboard()
window.SomaParc.getStatistics()
window.SomaParc.getCriticalVehicles()
window.SomaParc.getFilteredVehicles()
window.SomaParc.exportCSV()
window.SomaParc.exportExcel()
window.SomaParc.getSelectedScenario()
window.SomaParc.setSelectedScenario(id)
window.SomaParc.clearSelectedScenario()
window.SomaParc.exportScenario()
window.SomaParc.getExecutiveSummary()
window.SomaParc.getHealthIndex()
window.SomaParc.getRecommendations()
window.SomaParc.getComexReport()
window.SomaParc.exportPDF()
window.SomaParc.exportPowerPoint()
window.SomaParc.getFiveYearPlan()
window.SomaParc.optimize(constraints)
window.SomaParc.compareStrategies(constraints)
window.SomaParc.getExecutiveDecision()
window.SomaParc.getInvestmentPlan()
window.SomaParc.getConstraints()
window.SomaParc.getOptimizer()
window.SomaParc.exportComex()
window.SomaParc.exportComexPresentation()
```

---

## Procédure de test

1. Ouvrir `index.html` dans un navigateur moderne.
2. Vérifier que les données de démonstration se chargent.
3. Cliquer sur `Diagnostic`.
4. Vérifier :
   - import ;
   - parser ;
   - validation ;
   - scoring ;
   - dashboard ;
   - simulation ;
   - optimisation ;
   - exports ;
   - API publique ;
   - performance.
5. Importer un export Power BI réel.
6. Vérifier le rapport d'import et le centre des anomalies.
7. Tester les filtres et l'export des lignes filtrées.
8. Tester les scénarios.
9. Tester l'export COMEX JSON et l'export présentation HTML.
10. Tester l'impression PDF.

---

## Préparation future intégration SOMA

La V1.5.1 prépare une intégration propre :

- les données véhicules sont accessibles via `getVehicles()` ;
- les scénarios sont accessibles via `getSelectedScenario()` et `exportScenario()` ;
- le plan d'investissement est accessible via `getInvestmentPlan()` ;
- la synthèse COMEX est accessible via `getComexReport()` et `exportComex()`.

Aucune connexion avec SOMA n'est activée aujourd'hui.

---

## Préparation V1.6 / V2

Avant toute V2 IA, la suite logique serait :

1. validation des hypothèses métier avec le contrôle de gestion ;
2. ajout des données réelles : kilométrage, coûts d'entretien, VNC, financement ;
3. connexion Supabase/SOMA ;
4. génération d'un vrai `.pptx` si une bibliothèque dédiée est retenue ;
5. IA décisionnelle uniquement après stabilisation des données financières.
