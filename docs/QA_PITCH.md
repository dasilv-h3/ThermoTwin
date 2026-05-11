# Q&A anticipation — Pitch ThermoTwin

> Préparation aux questions du jury / partenaires GRDF / investisseurs.

[GPTT-217 / GPTT-218 / GPTT-219]

---

## Méthodologie

Cette liste anticipe les 20 questions les plus probables qu'on peut nous poser lors du pitch. Chaque question est classée par catégorie, avec une réponse préparée (60-90 secondes max à l'oral) et les arguments-clés à retenir.

---

## A. Questions techniques

### Q1. Quelle est la précision réelle de votre IA ?

**Réponse :**
Nos tests sur 100 images annotées manuellement par un thermicien certifié montrent une précision de détection des zones de déperdition supérieure à 90%. Sur le score thermique global, notre marge d'erreur est de ±0,5 point sur 10. Nous validons en continu avec GRDF sur des cas réels du parc francilien.

**Argument-clé :** Précision validée par un partenaire institutionnel reconnu (GRDF).

---

### Q2. Pourquoi GPT-4 Vision plutôt qu'un modèle propriétaire ?

**Réponse :**
Trois raisons. D'abord, le time-to-market : on est passés d'un POC à un produit en moins de 2 semaines, contre 6 mois minimum pour entraîner un modèle propre. Ensuite, la précision : GPT-4 Vision dépasse 90% sur notre dataset sans aucun fine-tuning. Enfin, on a un plan de migration vers notre modèle EfficientNetB0 ONNX déjà entraîné, qu'on activera dès qu'on aura assez de données utilisateurs annotées.

**Argument-clé :** Pragmatisme et plan de souveraineté technique.

---

### Q3. Que faites-vous si OpenAI tombe ou augmente ses prix ?

**Réponse :**
On a anticipé. Notre modèle EfficientNetB0 entraîné en interne est déjà exporté en ONNX, prêt à être déployé. Le basculement se ferait en moins de 48h, sans interruption pour les utilisateurs. C'est notre plan de continuité documenté dans le registre des risques. Côté coût, à $0,02 par scan, on reste très en dessous du seuil de rentabilité même avec une hausse de 5×.

**Argument-clé :** Plan B opérationnel, dépendance maîtrisée.

---

### Q4. Comment gérez-vous la confidentialité des photos des utilisateurs ?

**Réponse :**
Tout passe en HTTPS/TLS 1.3. Les photos sont chiffrées au repos en AES-256 sur nos serveurs. Les URLs d'accès sont signées HMAC SHA256 avec expiration 24h. Et surtout, nous ne partageons jamais les photos avec qui que ce soit — pas même OpenAI au-delà du temps d'analyse. Côté RGPD, l'utilisateur peut tout exporter ou tout supprimer en deux clics.

**Argument-clé :** RGPD by design, pas de revente de données.

---

### Q5. L'app fonctionne-t-elle hors ligne ?

**Réponse :**
La capture photo et le pré-traitement, oui. L'analyse IA, non — elle nécessite une connexion. On sauvegarde la photo en local via AsyncStorage si le réseau coupe, et on relance automatiquement l'upload dès qu'il revient. L'expérience est transparente pour l'utilisateur.

**Argument-clé :** Robustesse réseau pensée.

---

## B. Questions business

### Q6. Quel est votre modèle économique ?

**Réponse :**
Trois sources de revenus complémentaires. **Freemium B2C** : gratuit jusqu'à 5 scans/mois, puis 9,99€/mois ou 49€ à vie. **B2B Pro** : abonnement pour diagnostiqueurs, architectes, syndics, entre 99 et 299€/mois. **Marketplace artisans** : 15% de commission sur les devis signés. On vise 155 000€ d'ARR la première année, avec un break-even entre 15 et 24 mois.

**Argument-clé :** Modèle diversifié, pas de dépendance à une seule source.

---

### Q7. Pourquoi quelqu'un paierait pour quelque chose qui existe gratuitement (DPE) ?

**Réponse :**
Le DPE officiel coûte entre 100 et 250€ et prend plusieurs jours. Notre produit donne en 5 minutes une pré-analyse gratuite qui aide à savoir s'il faut ou non faire des travaux, et lesquels en priorité. Le DPE reste obligatoire pour vendre/louer, mais ThermoTwin sert en amont, à un autre moment de la décision. Notre cible Premium, ce sont les bricoleurs et propriétaires-rénovateurs qui veulent prioriser leurs travaux et simuler les économies — un usage que le DPE ne couvre pas.

**Argument-clé :** On adresse un besoin différent, en amont du DPE.

---

### Q8. Quel est votre CAC (coût d'acquisition) ?

**Réponse :**
On vise un CAC inférieur à 5€ grâce à trois leviers : partenariats avec GRDF (visibilité auprès de leur base), distribution via les grandes surfaces de bricolage (Leroy Merlin en discussion), et bouche-à-oreille amplifié par notre NPS de 85/100 mesuré sur les beta-testeurs.

**Argument-clé :** Distribution partenariale > publicité payante.

---

### Q9. Comment vous différenciez-vous de la concurrence ?

**Réponse :**
Trois différenciateurs. **Le smartphone seul** : pas de caméra thermique à acheter, pas d'expert à faire venir. **Le ROI chiffré** : on ne dit pas "il faut isoler", on dit "isoler ce mur vous économisera 340€/an et sera rentabilisé en 4 ans". **La marketplace intégrée** : on passe de la détection au devis en 2 minutes. Aucun concurrent ne propose cette chaîne complète aujourd'hui.

**Argument-clé :** Pas de concurrent direct sur la combinaison smartphone + ROI + marketplace.

---

### Q10. Quel est votre runway et avez-vous besoin de lever des fonds ?

**Réponse :**
Notre infrastructure POC tourne à coût zéro grâce au free tier Cloud Docker. Nos coûts opérationnels mensuels sont d'environ 4 400€ (cloud, IA, support). Pour passer à 10 000 utilisateurs actifs, on aurait besoin de 200 000€ sur 18 mois. On est ouverts aux discussions avec des partenaires stratégiques (GRDF, ADEME, fonds climatiques) plutôt qu'à un VC classique, pour préserver l'alignement avec notre mission.

**Argument-clé :** Modèle frugal, levée stratégique plutôt que financière.

---

## C. Questions partenariat / GRDF

### Q11. Pourquoi GRDF s'intéresserait à un outil qui pousse les gens à moins consommer de gaz ?

**Réponse :**
Parce que GRDF accompagne la transition énergétique. Leur objectif n'est pas de vendre plus de gaz, mais d'aider leurs clients à mieux consommer et à choisir des solutions efficientes. ThermoTwin oriente vers des travaux de rénovation, et GRDF y gagne en image de marque, en fidélisation, et en valorisation de son réseau d'artisans RGE. C'est un alignement gagnant-gagnant.

**Argument-clé :** Vision long terme partagée sur la transition énergétique.

---

### Q12. Que vous apporte concrètement GRDF ?

**Réponse :**
Trois choses. **La validation méthodologique** : un comité d'experts thermiciens valide nos calculs ROI. **L'accès au réseau artisans** : 2 000 artisans RGE référencés par GRDF Île-de-France constituent notre marketplace de lancement. **Le co-branding** : le badge "Partenaire GRDF" rassure les utilisateurs sur la fiabilité du diagnostic.

**Argument-clé :** Validation, distribution, crédibilité.

---

### Q13. Y a-t-il un risque de conflit d'intérêts ?

**Réponse :**
Non. Notre algorithme de recommandation est neutre sur le type d'énergie. On recommande l'isolation, les fenêtres, le chauffage — sans privilégier le gaz, l'électricité ou le bois. GRDF a accepté cette neutralité comme condition du partenariat. Nos recommandations sont auditables et nos données d'analyse sont consultables.

**Argument-clé :** Neutralité algorithmique contractualisée.

---

## D. Questions réglementaires / légales

### Q14. Avez-vous une responsabilité légale sur les recommandations ?

**Réponse :**
Notre positionnement est clair : ThermoTwin est un **pré-diagnostic pédagogique**, pas un DPE officiel. C'est écrit en clair dans l'app, dans le rapport PDF, et dans nos CGU. La responsabilité finale du choix de travaux et de leur réalisation revient à l'utilisateur et à l'artisan certifié. Nous avons une assurance RC pro qui couvre les éventuels litiges, mais le cadre juridique nous protège bien.

**Argument-clé :** Positionnement juridique clair, disclaimer omniprésent.

---

### Q15. Comment êtes-vous conformes au RGPD ?

**Réponse :**
On a designé l'app RGPD by design dès le premier jour. Tous les droits sont implémentés : accès, rectification, effacement, portabilité, opposition. Notre DPO est désigné (dpo@thermotwin.fr). Les données sont chiffrées, stockées en France, et purgées automatiquement après 3 ans d'inactivité.

**Argument-clé :** RGPD intégré dès la conception, pas une couche de patch.

---

## E. Questions équipe

### Q16. Combien êtes-vous dans l'équipe et avez-vous les compétences pour scaler ?

**Réponse :**
Nous sommes 3 sur le cœur produit : Kévin sur le backend et DevOps, Katia sur l'IA et le frontend, et moi sur le projet et la QA. On est encadrés par Achraf Halmoud côté académique. Pour scaler à 10 000+ utilisateurs, on prévoit deux recrutements clés : un dev mobile senior et un growth marketer.

**Argument-clé :** Équipe lean mais complète, plan de scale identifié.

---

### Q17. Comment gérez-vous le projet avec une équipe étudiante ?

**Réponse :**
On utilise les standards de l'industrie : GitFlow avec branches feature/develop/main, Conventional Commits, PR review obligatoire avec 1 reviewer minimum, CI/CD automatisée sur GitHub Actions, suivi Jira, et stand-ups hebdomadaires. Notre Definition of Done exige 70% de couverture de tests et passage de tous les checks CI. C'est documenté dans nos conventions de projet.

**Argument-clé :** Méthodologie pro, pas un projet étudiant amateur.

---

## F. Questions sur le marché

### Q18. Quelle est la taille de votre marché ?

**Réponse :**
En France, 5 millions de logements sont des passoires thermiques classées F ou G. La rénovation énergétique représente 75 milliards d'euros de marché par an d'ici 2030. Notre cible primaire — les 18 millions de propriétaires occupants — est massive. Même 1% de pénétration nous mettrait sur une trajectoire de 50 000 utilisateurs payants.

**Argument-clé :** Marché énorme, transition énergétique soutenue par l'État.

---

### Q19. Quels sont vos KPIs de succès à 6 et 12 mois ?

**Réponse :**

À 6 mois :
- 10 000 utilisateurs actifs mensuels
- NPS supérieur à 70
- Conversion Free → Premium supérieure à 5%

À 12 mois :
- 50 000 utilisateurs cumulés
- 155 000€ d'ARR
- 500 artisans RGE actifs sur la marketplace
- 3 partenariats stratégiques signés (au-delà de GRDF)

**Argument-clé :** Objectifs chiffrés, ambitieux mais atteignables.

---

### Q20. Quels sont vos plus grands risques ?

**Réponse :**
Trois risques identifiés. **La précision de l'IA** sur certains types de photos (mitigation : tests continus, prompt engineering). **La crédibilité du diagnostic gratuit** (mitigation : validation GRDF + ADEME, NPS visible). **La confusion avec le DPE officiel** (mitigation : disclaimer juridique clair, positionnement pédagogique). Tous sont documentés dans notre registre des risques, avec un plan de mitigation pour chacun.

**Argument-clé :** Risques connus, mitigation active. Transparence sur les limites.

---

## Cheat-sheet pour le jour J

### Les 5 chiffres à retenir

| Chiffre | Quoi |
|---|---|
| **>90%** | Précision IA validée |
| **5 min** | Durée d'un scan complet |
| **$0,02** | Coût IA par scan |
| **155 000€** | ARR cible Année 1 |
| **85/100** | NPS beta-testeurs |

### Les 3 messages-clés

1. **"Votre smartphone devient une caméra thermique intelligente."** — proposition de valeur en une phrase.
2. **"Du diagnostic au devis en 2 minutes."** — différenciation produit.
3. **"1er prix AGORIZE 2025, en partenariat avec GRDF."** — preuve sociale.

### Les pièges à éviter

- Ne pas survendre la précision (on dit "supérieure à 90%", pas "100%")
- Ne pas se comparer au DPE officiel (on est complémentaires, pas concurrents)
- Ne pas promettre des économies absolues (toujours dire "estimées sur la base de moyennes nationales")

---

*Document préparé par Thomas Bizet (chef de projet) — Avril 2026*
