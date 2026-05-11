# Registre des risques ThermoTwin

> Identification, évaluation et mitigation des risques projet.

[GPTT-229 / GPTT-230 / GPTT-231 / GPTT-232]

---

## Méthodologie

Chaque risque est noté sur deux axes :

- **Probabilité** (P) : Faible (1) / Moyen (2) / Élevé (3)
- **Impact** (I) : Faible (1) / Moyen (2) / Élevé (3) / Critique (4)
- **Criticité** (P × I) : 1-3 (vert) / 4-6 (orange) / 7-12 (rouge)

Statut : OUVERT / EN MITIGATION / RÉSOLU / ACCEPTÉ

Mise à jour : revue hebdomadaire en stand-up, revue mensuelle en sprint review.

---

## Synthèse

| ID | Catégorie | Risque | P | I | Criticité | Statut |
|---|---|---|---|---|---|---|
| R-01 | Technique | Précision GPT-4 Vision insuffisante | 2 | 3 | 6 (orange) | EN MITIGATION |
| R-02 | Technique | Latence OpenAI > SLO | 1 | 2 | 2 (vert) | EN MITIGATION |
| R-03 | Technique | Indisponibilité OpenAI | 1 | 3 | 3 (vert) | EN MITIGATION |
| R-04 | Technique | Coût IA explosif sur scaling | 2 | 3 | 6 (orange) | EN MITIGATION |
| R-05 | Technique | Bug critique en production | 2 | 3 | 6 (orange) | EN MITIGATION |
| R-06 | Sécurité | Fuite de données utilisateurs | 1 | 4 | 4 (orange) | EN MITIGATION |
| R-07 | Sécurité | Brute force / DDoS sur l'API | 2 | 2 | 4 (orange) | EN MITIGATION |
| R-08 | Business | Scepticisme crédibilité gratuit | 2 | 3 | 6 (orange) | EN MITIGATION |
| R-09 | Business | CAC trop élevé | 2 | 2 | 4 (orange) | OUVERT |
| R-10 | Business | Break-even > 24 mois | 2 | 2 | 4 (orange) | OUVERT |
| R-11 | Réglementaire | Confusion avec DPE officiel | 1 | 3 | 3 (vert) | EN MITIGATION |
| R-12 | Réglementaire | Non-conformité RGPD | 1 | 4 | 4 (orange) | EN MITIGATION |
| R-13 | Équipe | Indisponibilité d'un membre clé | 2 | 3 | 6 (orange) | OUVERT |
| R-14 | Équipe | Désengagement après projet académique | 2 | 4 | 8 (rouge) | OUVERT |
| R-15 | Partenariat | Rupture partenariat GRDF | 1 | 3 | 3 (vert) | OUVERT |
| R-16 | Planning | Retard sur le pitch AGORIZE | 1 | 3 | 3 (vert) | RÉSOLU |
| R-17 | Planning | Intégration frontend-backend non terminée | 2 | 3 | 6 (orange) | OUVERT |

---

## Détail des risques et plans de mitigation

### R-01 — Précision GPT-4 Vision insuffisante sur certains types de photos

**Description :** L'IA peut donner des résultats incohérents sur des photos très sombres, des matériaux atypiques (verrières, bardages bois), ou des prises de vue mal cadrées.

**Probabilité :** Moyenne (déjà observé sur 5-7% des tests internes)
**Impact :** Élevé (perte de crédibilité, mauvais avis utilisateurs)

**Plan de mitigation :**
- Tests systématiques sur 100 images annotées manuellement, mis à jour mensuellement
- Prompt engineering itératif avec versionning des prompts
- Garde-fou applicatif : si la confiance de l'IA < 70%, l'app demande une nouvelle photo
- Fallback automatique sur GPT-4 Turbo si GPT-4 Vision retourne une erreur
- Plan de migration vers EfficientNetB0 ONNX dès qu'on a 5 000 images annotées

**Indicateur de suivi :** Précision moyenne sur dataset de validation (cible : > 90%)
**Responsable :** Katia Djellali (IA)

---

### R-02 — Latence OpenAI supérieure au SLO (P95 > 15 secondes)

**Description :** L'API OpenAI peut ponctuellement avoir des latences élevées qui dégradent l'expérience utilisateur.

**Probabilité :** Faible (observé < 2% des appels)
**Impact :** Moyen (frustration utilisateur)

**Plan de mitigation :**
- Retry logic avec exponential backoff (3 tentatives : 1s / 2s / 4s)
- Cache des résultats par hash d'image (TTL 1h) — évite de re-analyser une photo identique
- Progress bar visible côté UX avec message rassurant
- Monitoring temps réel via Prometheus + alerte Slack si P95 > 12s sur 10 minutes

**Indicateur de suivi :** Latence P95 (cible : < 15s)
**Responsable :** Kevin Da Silva (Backend)

---

### R-03 — Indisponibilité totale d'OpenAI

**Description :** Une panne majeure d'OpenAI bloquerait complètement l'analyse de scans.

**Probabilité :** Faible (historiquement < 0,5% du temps)
**Impact :** Élevé (service indisponible)

**Plan de mitigation :**
- Détection automatique d'indisponibilité (3 erreurs 5xx consécutives)
- Message utilisateur clair : "Analyse temporairement indisponible, votre scan a été sauvegardé et sera traité dès le retour du service"
- Queue de scans en attente avec retry automatique
- Basculement vers notre modèle EfficientNetB0 ONNX activable en moins de 48h
- Alerte Slack critique + Email

**Indicateur de suivi :** Disponibilité OpenAI mesurée sur 7 jours glissants
**Responsable :** Kevin Da Silva (Backend)

---

### R-04 — Coût IA explosif sur scaling

**Description :** À 100 000 scans/mois, le coût OpenAI dépasserait 2 000€/mois, mettant à mal la rentabilité du Freemium.

**Probabilité :** Moyenne (corrélée au succès)
**Impact :** Élevé (impact direct sur la marge)

**Plan de mitigation :**
- Quota strict de 5 scans/mois en Free (limite OpenAI à 1 € par utilisateur Free annuel)
- Migration vers EfficientNetB0 ONNX self-hosté dès 10 000 scans/mois (économie 100%)
- Budget API surveillé en temps réel, alerte à 80% du quota mensuel
- Coût intégré dans le pricing Premium (9,99€/mois couvre largement les coûts)

**Indicateur de suivi :** Coût OpenAI / utilisateur actif / mois
**Responsable :** Thomas Bizet (Chef de projet) + Katia Djellali (IA)

---

### R-05 — Bug critique en production

**Description :** Un bug bloquant pourrait empêcher les scans ou corrompre les données.

**Probabilité :** Moyenne (inhérent au développement)
**Impact :** Élevé (perte d'utilisateurs)

**Plan de mitigation :**
- Pipeline CI/CD obligatoire : lint + tests + build avant tout merge
- Couverture de tests > 70% sur le backend (atteinte actuellement)
- Tests E2E Playwright sur les parcours critiques (auth, scan, marketplace)
- Rollback automatique Cloud Docker si health check fail 3× consécutif
- Procédure de rollback documentée (cf. PDF de déploiement)
- Astreinte tournante en cas de production

**Indicateur de suivi :** Taux d'erreur 5xx (cible : < 0,5%)
**Responsable :** Kevin Da Silva (Backend) + Thomas Bizet (QA)

---

### R-06 — Fuite de données utilisateurs (photos, emails, données scans)

**Description :** Une faille de sécurité pourrait exposer les données sensibles des utilisateurs.

**Probabilité :** Faible (architecture sécurisée by design)
**Impact :** Critique (RGPD, image de marque, sanctions CNIL)

**Plan de mitigation :**
- HTTPS/TLS 1.3 obligatoire sur toutes les routes
- bcrypt cost factor 12 pour les mots de passe
- JWT signés avec secret rotaté trimestriellement
- Chiffrement AES-256 at-rest sur MongoDB
- URLs signées HMAC SHA256 avec expiration 24h pour les photos
- Audit de sécurité avant chaque release majeure
- Plan de réponse à incident documenté (notification CNIL sous 72h)

**Indicateur de suivi :** Nombre d'incidents de sécurité (cible : 0)
**Responsable :** Kevin Da Silva (Backend) + Thomas Bizet (DPO)

---

### R-07 — Brute force / DDoS sur l'API

**Description :** Tentatives d'attaques sur l'endpoint de login ou de scan pour épuiser les ressources.

**Probabilité :** Moyenne (toute API publique en est cible)
**Impact :** Moyen (dégradation du service)

**Plan de mitigation :**
- Rate limiting : 5 req/min sur /auth/login, 100 req/h sur /api/*
- CORS restrictif en production (whitelist : app.thermotwin.fr uniquement)
- CDN avec protection DDoS (Cloudflare prévu en production)
- Détection d'anomalies sur les patterns d'usage
- Blacklist automatique des IPs suspectes (> 50 tentatives échouées en 1h)

**Indicateur de suivi :** Tentatives bloquées / jour
**Responsable :** Kevin Da Silva (Backend)

---

### R-08 — Scepticisme sur la crédibilité du diagnostic gratuit

**Description :** Les utilisateurs peuvent douter de la qualité d'un diagnostic offert gratuitement.

**Probabilité :** Moyenne (frein psychologique connu)
**Impact :** Élevé (impact direct sur l'adoption)

**Plan de mitigation :**
- Badge "Partenaire GRDF" visible dès l'onboarding et sur chaque rapport
- Mention "1er prix AGORIZE 2025" en page d'accueil
- NPS de 85/100 affiché sur la landing page (testimonials)
- Méthodologie expliquée en transparence (cf. Guide utilisateur)
- Validation ADEME en cours pour mention officielle

**Indicateur de suivi :** Taux de conversion download → inscription (cible : > 40%)
**Responsable :** Thomas Bizet (Chef de projet)

---

### R-09 — CAC (Coût d'Acquisition Client) trop élevé

**Description :** Les canaux d'acquisition payants pourraient coûter plus que la LTV utilisateur.

**Probabilité :** Moyenne
**Impact :** Moyen (impact sur la rentabilité)

**Plan de mitigation :**
- Stratégie d'acquisition non payante en priorité (SEO, bouche-à-oreille, partenariats)
- Partenariats GRDF, Leroy Merlin, écoles d'ingénieurs pour visibilité gratuite
- Programme de parrainage : 1 mois Premium offert pour chaque ami inscrit qui devient Premium
- Mesure du CAC par canal avec arbitrage hebdomadaire

**Indicateur de suivi :** CAC < 5€ tous canaux confondus
**Responsable :** Thomas Bizet (Chef de projet)

---

### R-10 — Break-even au-delà de 24 mois

**Description :** Si la conversion Free → Premium est trop lente, la rentabilité repousse.

**Probabilité :** Moyenne
**Impact :** Moyen (besoin de levée de fonds prolongée)

**Plan de mitigation :**
- 3 sources de revenus complémentaires (B2C, B2B, marketplace)
- A/B testing sur les murs de paiement Premium
- Limite Free à 5 scans/mois pour forcer la conversion (testée, validée par NPS)
- Plan de levée stratégique (200 K€) prévu si traction insuffisante après 12 mois

**Indicateur de suivi :** Taux de conversion Free → Premium (cible : > 5%)
**Responsable :** Thomas Bizet (Chef de projet)

---

### R-11 — Confusion juridique avec DPE officiel

**Description :** Un utilisateur pourrait croire que ThermoTwin remplace un DPE officiel et avoir un problème lors d'une vente ou location.

**Probabilité :** Faible (UX claire)
**Impact :** Élevé (risque juridique)

**Plan de mitigation :**
- Disclaimer "Pré-diagnostic pédagogique, ne remplace pas un DPE officiel" sur l'onboarding, dans le rapport PDF, et dans les CGU
- Orientation systématique vers les diagnostiqueurs RGE pour le DPE officiel
- Mention juridique dans les CGU acceptées à l'inscription
- Assurance RC pro souscrite (1M€ de couverture)

**Indicateur de suivi :** Nombre de litiges juridiques (cible : 0)
**Responsable :** Thomas Bizet (Chef de projet)

---

### R-12 — Non-conformité RGPD

**Description :** Une non-conformité RGPD pourrait entraîner des sanctions CNIL et un préjudice d'image.

**Probabilité :** Faible (RGPD by design)
**Impact :** Critique (sanctions jusqu'à 4% du CA mondial)

**Plan de mitigation :**
- DPO désigné : dpo@thermotwin.fr
- Tous les droits RGPD implémentés (accès, rectification, effacement, portabilité, opposition)
- Registre des traitements tenu à jour
- Conservation limitée à 3 ans après dernière activité, puis anonymisation
- Hébergement des données en France (OVH Strasbourg prévu en production)
- Audit RGPD annuel par un cabinet externe

**Indicateur de suivi :** Conformité à 100% sur audit annuel
**Responsable :** Thomas Bizet (DPO)

---

### R-13 — Indisponibilité ponctuelle d'un membre de l'équipe

**Description :** Maladie, examens, congés peuvent bloquer l'avancement si une seule personne maîtrise un sujet.

**Probabilité :** Moyenne
**Impact :** Élevé (l'équipe est petite)

**Plan de mitigation :**
- Documentation systématique sur Confluence (architecture, déploiement, IA)
- Pair programming sur les sujets critiques
- Code review obligatoire (2 paires d'yeux minimum sur chaque PR)
- Stand-up hebdomadaire pour anticiper les absences

**Indicateur de suivi :** Bus factor par module (cible : > 1 sur chaque sujet)
**Responsable :** Thomas Bizet (Chef de projet)

---

### R-14 — Désengagement après le projet académique

**Description :** Fin de l'encadrement H3 Hitema = risque de dispersion de l'équipe.

**Probabilité :** Moyenne (réalité étudiante)
**Impact :** Critique (fin du projet)

**Plan de mitigation :**
- Plan de continuité post-académique discuté en sprint review
- Discussions avec un incubateur (Station F, La Ruche) pour structurer l'après-projet
- Possibilité de levée pré-seed pour formaliser des salaires
- Open-source partiel envisagé pour pérenniser le code en cas de séparation

**Indicateur de suivi :** Engagement déclaré de chaque membre à 6/12 mois
**Responsable :** Thomas Bizet (Chef de projet)

---

### R-15 — Rupture du partenariat GRDF

**Description :** GRDF pourrait revoir sa stratégie et retirer son soutien.

**Probabilité :** Faible (engagement contractuel signé)
**Impact :** Élevé (perte de crédibilité et d'accès au réseau RGE)

**Plan de mitigation :**
- Diversification des partenariats (ADEME, FFB, Leroy Merlin en cours)
- Constitution d'un dossier ADEME pour reconnaissance officielle
- Maintien d'une qualité de livrables qui valorise le partenariat pour GRDF
- Clause de réversibilité dans le partenariat (préavis 6 mois)

**Indicateur de suivi :** NPS de satisfaction du partenaire GRDF (cible : > 8/10)
**Responsable :** Thomas Bizet (Chef de projet)

---

### R-16 — Retard sur le pitch AGORIZE [RÉSOLU]

**Description :** Risque historique. Le pitch a eu lieu le 10 avril 2026 dans les temps.

**Statut :** RÉSOLU — 1er prix obtenu, partenariat GRDF confirmé.

---

### R-17 — Intégration frontend-backend non terminée pour la phase de déploiement

**Description :** Le frontend a tous ses écrans, le backend a tous ses endpoints, mais la connexion entre les deux n'est pas finalisée.

**Probabilité :** Élevée à date du 27/04/2026 (déjà constaté)
**Impact :** Élevé (parcours utilisateur incomplet)

**Plan de mitigation :**
- Sprint dédié semaine 18 (du 28/04 au 04/05) avec Kevin + Katia
- Priorité aux flux critiques : auth, scan, résultats
- Tests d'intégration backend déjà en place pour faciliter le câblage
- Démo de la chaîne complète prévue en sprint review du 04/05

**Indicateur de suivi :** Pourcentage d'écrans connectés à l'API (cible : 100% au 04/05)
**Responsable :** Kevin Da Silva + Katia Djellali

---

## Procédure d'escalation des blocages

### Niveau 1 — Blocage technique courant

**Délai de résolution :** < 24h ouvrées
**Action :**
1. Documenter le blocage dans le ticket Jira (commentaire détaillé)
2. Demander de l'aide en stand-up du lendemain
3. Pair programming si nécessaire

### Niveau 2 — Blocage technique majeur ou dépendance externe

**Délai de résolution :** < 72h ouvrées
**Action :**
1. Ouvrir un ticket Jira de type **BLOCKER** lié au ticket bloqué
2. Notifier l'équipe via Slack dans le channel #thermotwin-tech
3. Réunion de 30 minutes le jour-même pour identifier la solution
4. Escalation à Thomas Bizet (chef de projet) sous 24h si pas de solution

### Niveau 3 — Blocage business / partenariat / juridique

**Délai de résolution :** < 1 semaine
**Action :**
1. Escalation directe au chef de projet
2. Réunion avec le partenaire/client concerné sous 48h
3. Notification de l'encadrement académique (Achraf Halmoud) si impact sur le projet
4. Plan de contournement temporaire mis en place

### Niveau 4 — Blocage critique (production down, incident sécurité)

**Délai de résolution :** Immédiat
**Action :**
1. Notification Slack #thermotwin-incident + Email + SMS
2. Mobilisation de toute l'équipe technique
3. Communication utilisateurs via la status page sous 30 minutes
4. Post-mortem rédigé sous 48h après résolution

---

## Suivi du registre

- **Revue hebdomadaire :** Lundi matin en stand-up — passage rapide sur les risques OUVERT et EN MITIGATION
- **Revue mensuelle :** Premier vendredi du mois — relecture complète, mise à jour des criticités
- **Revue trimestrielle :** Bilan global avec l'encadrement académique

Tout nouveau risque identifié doit être ajouté à ce registre dans les 48h.

---

*Maintenu par Thomas Bizet — Mise à jour mensuelle*
